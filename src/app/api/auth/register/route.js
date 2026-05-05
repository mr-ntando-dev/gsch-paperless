import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const SECRET_CODE = process.env.REGISTRATION_SECRET || 'devntando2026'

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, password, department, secretCode } = body

    // Validate secret code
    if (!secretCode || secretCode !== SECRET_CODE) {
      return NextResponse.json(
        { error: 'Invalid secret code. Contact your administrator for access.' },
        { status: 403 }
      )
    }

    // Validate required fields
    if (!name || !email || !password || !department) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format.' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      )
    }

    // Validate department is a valid enum value
    const validDepartments = [
      'CRD', 'PATIENT_CARE', 'BILLING', 'ACCOUNTS',
      'KITCHEN', 'SAFETY_MAINTENANCE', 'IT', 'MANAGEMENT', 'HOSPITAL_RELATIONS'
    ]
    if (!validDepartments.includes(department)) {
      return NextResponse.json(
        { error: 'Invalid department selected.' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      )
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'STAFF',
        department,
      },
    })

    return NextResponse.json(
      { message: 'Account created successfully.', user: { id: user.id, name: user.name, email: user.email } },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    
    // Provide more specific error messages based on error type
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      )
    }
    
    if (error.code === 'P1001' || error.code === 'P1002') {
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 }
      )
    }

    if (error.message?.includes("Can't reach database") || error.message?.includes('connect')) {
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
