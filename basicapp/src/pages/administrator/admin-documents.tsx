import DocumentsCRUDList from "@/components/document-crud-list";
import { useAuth } from "@/context/AuthContext";

export default function ManageAllDocuments() {
  const { tokenDetails } = useAuth();

  return (
    <>
      {tokenDetails && (
        <DocumentsCRUDList tokenDetails={tokenDetails} adminMode={true} />
      )}
    </>
  );
}
