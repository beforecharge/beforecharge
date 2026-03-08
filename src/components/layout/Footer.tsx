import React from "react";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="border-t py-8 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <p className="text-sm text-muted-foreground">
              © 2025 BeforeCharge. All rights reserved.
            </p>
          </div>
          <div className="flex items-center space-x-6">
            <Link
              to="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/support"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Support
            </Link>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Zap className="h-4 w-4 text-primary" />
            <span>Powered by</span>
            <span className="font-semibold text-primary">ZodeNexus</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;