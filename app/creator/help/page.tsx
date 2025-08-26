"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { 
  HelpCircle, 
  Search, 
  MessageCircle,
  Mail,
  Phone,
  Book,
  Video,
  FileText,
  ChevronRight
} from "lucide-react"

export default function Help() {
  return (
    <div>
      <PageHeader 
        title="Help & Support" 
        description="Get help with your surveys and account"
      />
      
      <div className="space-y-6">

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search for help articles, tutorials, or FAQs..." 
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Help */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Help</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Getting Started", icon: Book, desc: "Learn the basics of creating surveys" },
                  { title: "Video Tutorials", icon: Video, desc: "Watch step-by-step guides" },
                  { title: "Best Practices", icon: FileText, desc: "Tips for better survey results" },
                  { title: "Troubleshooting", icon: HelpCircle, desc: "Common issues and solutions" },
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-slate-50 cursor-pointer">
                    <item.icon className="h-5 w-5 text-[#013f5c] mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQs */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  question: "How do I create my first survey?",
                  answer: "Click on 'Create Survey' in the sidebar, fill in your survey details, add questions, and configure your targeting options."
                },
                {
                  question: "How much do survey responses cost?",
                  answer: "Response costs vary based on targeting criteria, typically ranging from ₦10-50 per response depending on demographics."
                },
                {
                  question: "How long does it take to get responses?",
                  answer: "Most surveys start receiving responses within 24 hours of launch, with completion times varying by audience size."
                },
                {
                  question: "Can I edit a survey after launching?",
                  answer: "You can make limited edits to live surveys. Major changes require pausing the survey first."
                },
                {
                  question: "How do I download survey results?",
                  answer: "Go to your survey's analytics page and click the 'Export' button to download results in CSV or Excel format."
                }
              ].map((faq, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">{faq.question}</h3>
                  <p className="text-sm text-slate-600">{faq.answer}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" className="mt-1" />
                </div>
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="What can we help you with?" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Describe your issue or question in detail..." 
                  className="mt-1"
                  rows={4}
                />
              </div>
              <Button className="bg-[#013f5c] hover:bg-[#0b577a]">
                <Mail className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Options */}
          <Card>
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <MessageCircle className="h-5 w-5 text-[#013f5c]" />
                <div>
                  <p className="font-medium">Live Chat</p>
                  <p className="text-sm text-slate-600">Available 9 AM - 6 PM</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <Mail className="h-5 w-5 text-[#013f5c]" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-slate-600">support@onetime.com</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <Phone className="h-5 w-5 text-[#013f5c]" />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-sm text-slate-600">+234 800 123 4567</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Survey Platform</span>
                <Badge className="bg-green-100 text-green-800">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Payment System</span>
                <Badge className="bg-green-100 text-green-800">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Analytics</span>
                <Badge className="bg-green-100 text-green-800">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  Operational
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                <Book className="h-4 w-4 mr-2" />
                Documentation
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Video className="h-4 w-4 mr-2" />
                Video Tutorials
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                API Reference
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <MessageCircle className="h-4 w-4 mr-2" />
                Community Forum
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  )
}