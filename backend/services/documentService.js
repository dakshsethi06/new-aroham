// services/documentService.js — mock document verification manager
const supabase = require("../config/supabase");

async function listDocuments(applicationId) {
  const { data, error } = await supabase
    .from("astrologer_documents")
    .select("*")
    .eq("application_id", applicationId);

  if (error) throw new Error(error.message);
  return data || [];
}

async function uploadDocument(applicationId, documentType, file) {
  // Mock file path storage url
  const filePath = `documents/${applicationId}/${documentType}_${Date.now()}.png`;

  const { data, error } = await supabase
    .from("astrologer_documents")
    .upsert({
      application_id: applicationId,
      document_type: documentType,
      file_path: filePath,
      file_name: file.originalname || "document.png",
      mime_type: file.mimetype || "image/png",
      file_size_bytes: file.size || 1024,
      status: "PENDING",
      uploaded_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

async function deleteDocument(docId, applicationId) {
  const { error } = await supabase
    .from("astrologer_documents")
    .delete()
    .eq("id", docId)
    .eq("application_id", applicationId);

  if (error) throw new Error(error.message);
  return true;
}

module.exports = {
  listDocuments,
  uploadDocument,
  deleteDocument,
};
