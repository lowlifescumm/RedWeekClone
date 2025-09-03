import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function SearchForm() {
  const [query, setQuery] = useState("");
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setLocation(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-xl max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search by location, resort name, or brand"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            data-testid="search-input"
          />
        </div>
        <Button 
          type="submit"
          className="bg-primary text-primary-foreground px-8 py-3 rounded-md hover:bg-primary/90 transition-colors font-medium"
          data-testid="search-button"
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>
    </div>
  );
}
