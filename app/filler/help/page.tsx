"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  FileText, 
  Search,
  ChevronRight,
  Clock,
  CheckCircle
} from "lucide-react"

const faqs = [
  {
    question: "How do I get paid for completing surveys?",
    answer: "Payments are processed within 24-48 hours after survey completion and approval. Money is sent directly to your registered bank account.",
    category: "Payments"
  },
  {
    question: "Why was my survey response rejected?",
    answer: "Surveys may be rejected for incomplete responses, inconsistent answers, or failing quality checks. Always read instructions carefully.",
    category: "Quality"
  },
  {
    question: "How can I increase my survey invitations?",
    answer: "Complete your profile thoroughly, maintain high quality responses, and keep your demographic information updated.",
    category: "Surveys"
  },
  {
    question: "What is the minimum withdrawal amount?",
    answer: "The minimum withdrawal amount is ₦1,000. You can set up auto-withdrawal in your settings.",
    category: "Payments"
  },
  {
    question: "How do I update my profile information?",
    answer: "Go to Settings > Profile Settings to update your personal information, demographics, and preferences.",
    category: "Account"
  }
]

const supportTickets = [
  {
    id: "TK-001",
    subject: "Payment not received",
    status: "resolved",
    createdAt: "2024-01-15",
    category: "Payment"
  },
  {
    id: "TK-002", 
    subject: "Survey completion issue",
    status: "pending",
    createdAt: "2024-01-14",
    category: "Technical"
  }
]

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Help & Support</h1>
        <p className="text-slate-600">Get help with your account and find answers to common questions</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Live Chat</p>
              <p className="text-sm text-slate-600">Get instant help</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Mail className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Email Support</p>
              <p className="text-sm text-slate-600">support@onetime.com</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Phone className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Phone Support</p>
              <p className="text-sm text-slate-600">+234 800 123 4567</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search FAQs */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Search className="h-5 w-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-900">Search Help Articles</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search for help articles, FAQs, or guides..." 
            className="pl-10"
          />
        </div>
      </Card>

      {/* FAQs */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <HelpCircle className="h-5 w-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-900">Frequently Asked Questions</h2>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium text-slate-900">{faq.question}</h3>
                    <Badge variant="outline" className="text-xs">
                      {faq.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">{faq.answer}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Support Tickets */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">My Support Tickets</h2>
          </div>
          <Button size="sm">New Ticket</Button>
        </div>
        
        <div className="space-y-3">
          {supportTickets.map((ticket) => (
            <div key={ticket.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  {ticket.status === 'resolved' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{ticket.subject}</p>
                  <p className="text-sm text-slate-600">#{ticket.id} • {ticket.createdAt}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={ticket.status === 'resolved' ? 'default' : 'secondary'}
                  className={ticket.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}
                >
                  {ticket.status}
                </Badge>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Contact Form */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <MessageCircle className="h-5 w-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-900">Contact Support</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
            <Input placeholder="Brief description of your issue" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <Input placeholder="Select category" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
            <Textarea 
              placeholder="Describe your issue in detail..."
              rows={4}
            />
          </div>
          
          <Button>Send Message</Button>
        </div>
      </Card>
    </div>
  )
}