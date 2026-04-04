import { createAdminClient } from "@/lib/supabase/admin";

export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const supabase = createAdminClient();

  // Convert File to ArrayBuffer for server-side upload
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    console.error("Upload error:", error);
    return { url: null, error: error.message };
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return { url: urlData.publicUrl, error: null };
}
