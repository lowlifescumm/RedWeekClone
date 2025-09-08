import { Construction, MessageCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Forums() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mb-4">
                <Construction className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Forums Under Construction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-center">
                <MessageCircle className="w-12 h-12 text-gray-400" />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Community Forums Coming Soon!
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  We're building an amazing community space where timeshare owners and travelers can connect, share experiences, and help each other find the perfect vacation rental.
                </p>
                
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    What's Coming:
                  </h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 text-left">
                    <li>• Resort reviews and recommendations</li>
                    <li>• Timeshare buying and selling advice</li>
                    <li>• Vacation planning tips</li>
                    <li>• Community Q&A sections</li>
                    <li>• Local destination insights</li>
                  </ul>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Want to be notified when forums launch? Contact us at{" "}
                  <a 
                    href="mailto:sales@tailoredtimesolutions.com" 
                    className="text-primary hover:underline"
                  >
                    sales@tailoredtimesolutions.com
                  </a>
                </p>
              </div>

              <div className="pt-4">
                <Link href="/">
                  <Button className="w-full" data-testid="back-to-home">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}