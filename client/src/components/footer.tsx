import { Link } from "wouter";
import { Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-primary text-primary-foreground px-3 py-2 rounded-md font-bold text-xl">
                RedWeek
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              The world's largest timeshare marketplace connecting owners and travelers worldwide.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white" data-testid="social-facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white" data-testid="social-twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white" data-testid="social-instagram">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">For Travelers</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/search" data-testid="footer-browse-rentals">
                  <a className="hover:text-white">Browse Rentals</a>
                </Link>
              </li>
              <li>
                <Link href="/search" data-testid="footer-search-resorts">
                  <a className="hover:text-white">Search Resorts</a>
                </Link>
              </li>
              <li>
                <Link href="/search" data-testid="footer-destinations">
                  <a className="hover:text-white">Destinations</a>
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white" data-testid="footer-travel-tips">Travel Tips</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">For Owners</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white" data-testid="footer-list-timeshare">List Your Timeshare</a>
              </li>
              <li>
                <a href="#" className="hover:text-white" data-testid="footer-sell-timeshare">Sell Your Timeshare</a>
              </li>
              <li>
                <a href="#" className="hover:text-white" data-testid="footer-owner-resources">Owner Resources</a>
              </li>
              <li>
                <a href="#" className="hover:text-white" data-testid="footer-forums">Forums</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white" data-testid="footer-help-center">Help Center</a>
              </li>
              <li>
                <a href="#" className="hover:text-white" data-testid="footer-contact">Contact Us</a>
              </li>
              <li>
                <a href="#" className="hover:text-white" data-testid="footer-safety">Safety & Trust</a>
              </li>
              <li>
                <a href="#" className="hover:text-white" data-testid="footer-terms">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 RedWeek. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </div>
    </footer>
  );
}
