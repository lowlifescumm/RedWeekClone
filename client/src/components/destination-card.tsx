import { Link } from "wouter";

interface DestinationCardProps {
  name: string;
  imageUrl: string;
  searchQuery: string;
}

export default function DestinationCard({ name, imageUrl, searchQuery }: DestinationCardProps) {
  return (
    <Link href={`/search?q=${encodeURIComponent(searchQuery)}`} data-testid={`destination-link-${name.toLowerCase()}`}>
      <a className="group">
        <div className="relative rounded-lg overflow-hidden aspect-square">
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            data-testid={`destination-image-${name.toLowerCase()}`}
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all">
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="font-semibold text-lg" data-testid={`destination-name-${name.toLowerCase()}`}>
                {name}
              </h3>
            </div>
          </div>
        </div>
      </a>
    </Link>
  );
}
