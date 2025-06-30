import ImagesCRUDList from "@/components/images-crud-list";
import { useAuth } from "@/context/AuthContext";

export default function ManageAllImages() {
  const { tokenDetails } = useAuth();

  return (
    <>
      {tokenDetails && (
        <ImagesCRUDList tokenDetails={tokenDetails} adminMode={true} />
      )}
    </>
  );
}
