import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request, { params }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = params

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        admissions: { orderBy: { createdAt: 'desc' } },
        observations: { orderBy: { createdAt: 'desc' } },
        dayCareRecords: { orderBy: { createdAt: 'desc' } },
        kitchenRequests: { orderBy: { createdAt: 'desc' }, take: 20 },
        patientMessages: { orderBy: { createdAt: 'desc' }, take: 20 },
        invoices: { include: { lineItems: true }, orderBy: { createdAt: 'desc' } },
      },
    })

    if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 })

    // Build unified timeline
    const timeline = []

    patient.admissions.forEach(a => timeline.push({
      id: a.id, type: 'ADMISSION', date: a.createdAt,
      title: `Admission — Ward ${a.ward}${a.bed ? ', Bed ' + a.bed : ''}`,
      detail: `Dr. ${a.doctor}${a.diagnosis ? ' · ' + a.diagnosis : ''}`,
      status: a.status, meta: a,
    }))
    patient.observations.forEach(o => timeline.push({
      id: o.id, type: 'OBSERVATION', date: o.createdAt,
      title: `Observation — ${o.observationArea}`,
      detail: `${o.reason} · Dr. ${o.doctor}`,
      status: o.status, meta: o,
    }))
    patient.dayCareRecords.forEach(d => timeline.push({
      id: d.id, type: 'DAYCARE', date: d.createdAt,
      title: `Day Care — ${d.date}`,
      detail: `${d.status}`,
      status: d.status, meta: d,
    }))
    patient.invoices.forEach(i => timeline.push({
      id: i.id, type: 'INVOICE', date: i.createdAt,
      title: `Invoice ${i.invoiceNumber}`,
      detail: `$${i.totalAmount.toFixed(2)} · ${i.status}`,
      status: i.status, meta: i,
    }))

    timeline.sort((a, b) => new Date(b.date) - new Date(a.date))

    return NextResponse.json({ patient, timeline })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
