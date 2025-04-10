import { Collection } from "@/types/view/models";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

const CollectionCard = ({ collection }: { collection: Collection }) => {
  return (
    <Card className="card-bg" key={collection.id}>
      <a href={`/collections/${collection.id}`} key={collection.id}>
        <CardHeader>
          <CardTitle>
            <span>{collection.name}</span>
          </CardTitle>
          {/* <CardDescription>{collection.description}</CardDescription> */}
          <CardContent></CardContent>
        </CardHeader>
      </a>
    </Card>
  );
};

export default CollectionCard;
