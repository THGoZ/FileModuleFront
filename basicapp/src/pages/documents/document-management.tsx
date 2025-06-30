import DocumentsCRUDList from "@/components/document-crud-list";
import { useAuth } from "@/context/AuthContext";

export default function DocumentManagement() {
  const {tokenDetails} = useAuth ();

  return (
    <>
    {tokenDetails &&(
    <DocumentsCRUDList tokenDetails={tokenDetails} />
    )}
    </>
  )


}