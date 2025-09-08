import { Mail, Phone, MessageSquare, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Contact Us
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Get in touch with our timeshare experts. We're here to help you find the perfect vacation rental.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Contact Information */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Get in Touch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Email Us</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Send us your questions and we'll respond within 24 hours.
                    </p>
                    <a
                      href="mailto:sales@tailoredtimesolutions.com"
                      className="text-primary hover:underline font-medium"
                      data-testid="contact-email"
                    >
                      sales@tailoredtimesolutions.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Call Us</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Speak directly with our timeshare specialists.
                    </p>
                    <a
                      href="tel:8773832129"
                      className="text-primary hover:underline font-medium text-lg"
                      data-testid="contact-phone"
                    >
                      (877) 383-2129
                    </a>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Monday - Friday: 9 AM - 6 PM EST<br />
                      Saturday: 10 AM - 4 PM EST
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>How We Can Help</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold">For Travelers</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Find and book verified timeshare rentals from trusted owners
                    </p>
                  </div>
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold">For Owners</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      List your timeshare for rent or sale with our professional support
                    </p>
                  </div>
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold">Escrow Services</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Secure transactions through our partnership with concordtitle.net
                    </p>
                  </div>
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold">Technical Support</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Website assistance and account management help
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <Card className="shadow-lg mb-8">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">How do I list my timeshare?</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Simply create an account and use our "List My Timeshare" feature. You'll need your ownership contract for verification.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Are bookings secure?</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Yes! All transactions are protected through our escrow service partnership with concordtitle.net.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">What are your fees?</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Contact us for detailed information about our competitive fee structure for both renters and owners.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link href="/">
              <Button variant="outline" data-testid="back-to-home">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}