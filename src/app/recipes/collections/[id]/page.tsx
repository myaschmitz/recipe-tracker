import { Collection } from "@/types/view/models";
import { useParams } from "next/navigation";
import { useState } from "react";

const CollectionPage = () => {
  const params = useParams();
  const id = params.id?.toString();
  const [collection, setCollection] = useState<Collection>();

  return (
    <div>
      <h1>Collection</h1>
    </div>
  );
};

export default CollectionPage;
