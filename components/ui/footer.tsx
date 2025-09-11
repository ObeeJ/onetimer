import Link from "next/link"
import { AnimatedLogo } from "./animated-logo"
import { Linkedin, Twitter, Instagram, Facebook } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="mb-4">
              <AnimatedLogo />
            </div>
            <p className="text-slate-600 leading-relaxed">
              OneTime Survey is Nigeria's premier survey platform connecting businesses with real people. 
              We empower individuals to earn money by sharing their valuable opinions while helping companies 
              make data-driven decisions. Join thousands of Nigerians who trust us for reliable income 
              opportunities and meaningful market research.
            </p>
          </div>
          <div className="text-center md:text-right">
            <h3 className="text-lg font-semibold mb-4 text-slate-900">Connect with us</h3>
            <div className="flex justify-center md:justify-end space-x-4">
              <a href="#" className="p-2 rounded-full bg-slate-100 hover:bg-[#013F5C] hover:text-white transition-colors">
                <Linkedin className="h-5 w-5 text-slate-600" />
              </a>
              <a href="#" className="p-2 rounded-full bg-slate-100 hover:bg-[#013F5C] hover:text-white transition-colors">
                <Twitter className="h-5 w-5 text-slate-600" />
              </a>
              <a href="#" className="p-2 rounded-full bg-slate-100 hover:bg-[#013F5C] hover:text-white transition-colors">
                <Instagram className="h-5 w-5 text-slate-600" />
              </a>
              <a href="#" className="p-2 rounded-full bg-slate-100 hover:bg-[#013F5C] hover:text-white transition-colors">
                <Facebook className="h-5 w-5 text-slate-600" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-200 mt-8 pt-8 text-center text-slate-500">
          <p>&copy; 2024 OneTime Survey. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}