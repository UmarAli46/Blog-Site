import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase-config"; 

export class FirebaseUploadAdapter {
  private loader: any;

  constructor(loader: any) {
    this.loader = loader;
    console.log("🔥 FirebaseUploadAdapter instance created");
  }

  upload(): Promise<{ default: string }> {
    console.log("upload() called"); 
    return this.loader.file.then(
      (file: File) =>
        new Promise<{ default: string }>((resolve, reject) => {
          console.log("📁 Uploading:", file.name, file.size); 

          if (!storage) {
            console.error("storage is undefined! Check firebase-config import");
            reject("Firebase storage not initialized");
            return;
          }

          const storageRef = ref(
            storage,
            `blogImages/${Date.now()}_${file.name}`
          );
          const uploadTask = uploadBytesResumable(storageRef, file);

          uploadTask.on(
            "state_changed",
            (snapshot) => {
              this.loader.uploadTotal = snapshot.totalBytes;
              this.loader.uploaded = snapshot.bytesTransferred;
              console.log(
                `⏳ Progress: ${Math.round(
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                )}%`
              );
            },
            (error) => {
              console.error("Upload failed:", error.code, error.message);
              reject(error.message);
            },
            async () => {
              const downloadURL = await getDownloadURL(
                uploadTask.snapshot.ref
              );
              console.log("Done! URL:", downloadURL);
              resolve({ default: downloadURL });
            }
          );
        })
    );
  }

  abort(): void {
    console.log("Upload aborted");
  }
}

export function FirebaseUploadAdapterPlugin(editor: any): void {
  console.log("FirebaseUploadAdapterPlugin registered"); 

  editor.plugins.get("FileRepository").createUploadAdapter = (loader: any) => {
    console.log("createUploadAdapter called"); 
    return new FirebaseUploadAdapter(loader);
  };
}