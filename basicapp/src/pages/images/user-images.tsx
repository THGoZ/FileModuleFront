import ImagesCRUDList from "@/components/images-crud-list";
import { useAuth } from "@/context/AuthContext";

export default function ImageManagment() {
  const { tokenDetails } = useAuth();

  return (
    <>
      {tokenDetails && (
        <ImagesCRUDList tokenDetails={tokenDetails} />
      )}
    </>
  );
}
