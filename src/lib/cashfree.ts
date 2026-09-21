/**
 * Cashfree Payment Gateway Integration Helper
 * API Version: 2023-08-01
 */

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || ''
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || ''
const CASHFREE_ENV = process.env.CASHFREE_ENV || 'production'

const CASHFREE_BASE_URL =
    CASHFREE_ENV === 'production'
        ? 'https://api.cashfree.com/pg'
        : 'https://sandbox.cashfree.com/pg'

export interface CreateOrderParams {
    orderId: string
    orderAmount: number
    orderCurrency?: string
    customerDetails: {
        customerId: string
        customerName: string
        customerEmail: string
        customerPhone: string
    }
    orderMeta?: {
        returnUrl?: string
        notifyUrl?: string
    }
    orderNote?: string
}

export interface CashfreeOrderResponse {
    cf_order_id: string
    order_id: string
    entity: string
    order_currency: string
    order_amount: number
    order_status: 'ACTIVE' | 'PAID' | 'EXPIRED' | 'TERMINATED'
    payment_session_id: string
    order_expiry_time?: string
    customer_details?: {
        customer_id: string
        customer_name: string
        customer_email: string
        customer_phone: string
    }
    message?: string
    code?: string
    type?: string
}

export async function createCashfreeOrder(
    params: CreateOrderParams
): Promise<CashfreeOrderResponse> {
    if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
        throw new Error('Cashfree credentials are not configured in environment')
    }

    // Clean phone number: Cashfree requires valid 10-digit number
    let cleanPhone = params.customerDetails.customerPhone.replace(/[^0-9]/g, '')
    if (cleanPhone.length > 10) {
        cleanPhone = cleanPhone.slice(-10)
    }
    if (cleanPhone.length < 10) {
        cleanPhone = '9999999999' // safe fallback
    }

    const payload = {
        order_id: params.orderId,
        order_amount: Number(params.orderAmount.toFixed(2)),
        order_currency: params.orderCurrency || 'INR',
        customer_details: {
            customer_id: params.customerDetails.customerId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50),
            customer_name: params.customerDetails.customerName || 'Customer',
            customer_email: params.customerDetails.customerEmail,
            customer_phone: cleanPhone
        },
        order_meta: {
            return_url: params.orderMeta?.returnUrl || ''
        },
        order_note: params.orderNote || 'Prodsnap Order'
    }

    const response = await fetch(`${CASHFREE_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-client-id': CASHFREE_APP_ID,
            'x-client-secret': CASHFREE_SECRET_KEY,
            'x-api-version': '2023-08-01'
        },
        body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
        console.error('[Cashfree] Order creation error:', data)
        throw new Error(data.message || `Cashfree error: ${response.statusText}`)
    }

    return data as CashfreeOrderResponse
}

export async function getCashfreeOrder(orderId: string): Promise<CashfreeOrderResponse> {
    if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
        throw new Error('Cashfree credentials are not configured in environment')
    }

    const response = await fetch(`${CASHFREE_BASE_URL}/orders/${orderId}`, {
        method: 'GET',
        headers: {
            'x-client-id': CASHFREE_APP_ID,
            'x-client-secret': CASHFREE_SECRET_KEY,
            'x-api-version': '2023-08-01'
        }
    })

    const data = await response.json()

    if (!response.ok) {
        console.error(`[Cashfree] Failed to fetch order ${orderId}:`, data)
        throw new Error(data.message || `Cashfree fetch error: ${response.statusText}`)
    }

    return data as CashfreeOrderResponse
}
