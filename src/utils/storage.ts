import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../FirebaseConfig'

export const uploadImage = async (file: File, path: string): Promise<string> => {
    if (!storage) {
        throw new Error('Firebase Storage is not configured')
    }

    const storageRef = ref(storage, `products/${path}`)
    await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(storageRef)
    return downloadURL
}

export const uploadProductImage = async (file: File, productId: string): Promise<string> => {
    const fileName = `${productId}-${Date.now()}.${file.name.split('.').pop()}`
    return uploadImage(file, fileName)
}

