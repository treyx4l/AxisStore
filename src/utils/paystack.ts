// Paystack integration utilities
declare global {
    interface Window {
        PaystackPop: any
    }
}

export interface PaystackConfig {
    key: string
    email: string
    amount: number // in pesewas (kobo)
    ref: string
    currency?: string // Currency code (default: 'GHS' for Ghanaian Cedi)
    metadata?: {
        custom_fields: Array<{
            display_name: string
            variable_name: string
            value: string
        }>
    }
    callback: (response: any) => void
    onClose: () => void
}

export const initializePaystack = (config: PaystackConfig) => {
    if (typeof window === 'undefined' || !window.PaystackPop) {
        throw new Error('Paystack script not loaded. Please add Paystack script to your HTML.')
    }

    const handler = window.PaystackPop.setup({
        key: config.key,
        email: config.email,
        amount: config.amount,
        ref: config.ref,
        currency: config.currency || 'GHS', // Default to GHS (Ghanaian Cedi)
        metadata: config.metadata,
        callback: (response: any) => {
            config.callback(response)
        },
        onClose: () => {
            config.onClose()
        },
    })

    handler.openIframe()
}

export const generatePaymentReference = (orderId: string): string => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 9).toUpperCase()
    return `PAY-${timestamp}-${random}`
}

