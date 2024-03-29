'use server'

import { z } from 'zod'
import { sql } from '@vercel/postgres'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string()
})

export async function deleteInvoice (id: string) {
    try {
        await sql`DEETE FROM invoices WHERE id = ${id}`
        revalidatePath('/dashboard/invoices')
    } catch (error) {
        return {
            message: 'Database Error: la suppression de la fracture à échoué.'
        }
    }
}

const UpdateInvoice = FormSchema.omit({id: true, date: true})
export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } =  UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    })
    const amountInCent = amount * 100
    const date = new Date().toISOString().split('T')[0]

    try {

        await sql `
            INSERT INTO invoices (customer_id, amount, status, date)
            VALUES (${customerId}, ${amountInCent}, ${status}, ${date})
        `
    } catch (error) {
        return {
            message: 'Database Error: la mise à jour de la fracture à échoué.'
        }
    }

    revalidatePath('/dashboard/invoices')
    redirect('/dashboard/invoices')
}

const CreateInvoice = FormSchema.omit({id:true, date:true})
export async function createInvoice(formData: FormData) {
    const {customerId, amount, status} = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    }) 
    const amountInCent = amount * 100
    const date = new Date().toISOString().split('T')[0]

    try {
        await sql `
            INSERT INTO invoices (customer_id, amount, status, date)
            VALUES (${customerId}, ${amountInCent}, ${status}, ${date})
        `
    } catch (error) {
        return {
            message: 'Database Error: la création de la fracture à échoué.'
        }
    }

    revalidatePath('/dashboard/invoices')
    redirect('/dashboard/invoices')
    // const rawFormData = Object.fromEntries(formData.entries());     

    // Test it out:
    
}