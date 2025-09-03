import SearchForm from "./search-form";
import { Link } from "wouter";

export default function HeroSection() {
  return (
    <section className="relative h-96 lg:h-[500px] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')"
        }}
      />
      <div className="absolute inset-0 bg-black bg-opacity-40" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
        <div className="text-center text-white max-w-4xl mx-auto">
          <h1 className="text-4xl lg:text-6xl font-bold mb-4" data-testid="hero-title">
            The World's Largest <br />
            <span className="text-red-400">Timeshare Marketplace</span>
          </h1>
          <p className="text-xl lg:text-2xl mb-8 text-gray-200" data-testid="hero-subtitle">
            Join the most trusted timeshare community
          </p>
          
          {/* Search Form */}
          <SearchForm />
          
          {/* Quick Links */}
          <div className="flex flex-wrap gap-2 mt-4 text-sm justify-center">
            <span className="text-muted-foreground">or browse:</span>
            <Link href="/search?q=Disney" data-testid="quick-link-disney">
              <span className="text-red-300 hover:underline cursor-pointer">Disney,</span>
            </Link>
            <Link href="/search?q=Thanksgiving" data-testid="quick-link-thanksgiving">
              <span className="text-red-300 hover:underline cursor-pointer">Thanksgiving,</span>
            </Link>
            <Link href="/search?q=Las Vegas" data-testid="quick-link-vegas">
              <span className="text-red-300 hover:underline cursor-pointer">Las Vegas,</span>
            </Link>
            <Link href="/search?q=Aruba" data-testid="quick-link-aruba">
              <span className="text-red-300 hover:underline cursor-pointer">Aruba,</span>
            </Link>
            <Link href="/search?q=Hawaii" data-testid="quick-link-hawaii">
              <span className="text-red-300 hover:underline cursor-pointer">Hawaii,</span>
            </Link>
            <Link href="/search?q=Mexico" data-testid="quick-link-mexico">
              <span className="text-red-300 hover:underline cursor-pointer">Mexico,</span>
            </Link>
            <Link href="/search?q=California" data-testid="quick-link-california">
              <span className="text-red-300 hover:underline cursor-pointer">California,</span>
            </Link>
            <Link href="/search" data-testid="quick-link-more">
              <span className="text-red-300 hover:underline cursor-pointer">and more</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
