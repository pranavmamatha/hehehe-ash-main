'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductsSection from "@/components/sections/ProductsSection";
import NewsSection from "@/components/sections/NewsSection";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { SearchIcon } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* News and Products Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* News Section */}
        <div className="h-[550px] p-6 rounded-lg border bg-card">
          <NewsSection />
        </div>

        {/* Products Section */}
        <div className="h-[550px] p-6 rounded-lg border bg-card">
          <ProductsSection />
        </div>
      </section>

      {/* Weather Map Section */}
      <section className="rounded-lg border bg-card overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Global Threat Index</h2>
        </div>
        <div className="aspect-video bg-accent">
          <img src="/map.jpg" alt="Global Threat Index" width={3000} height={5000} />
          <img src="/map.jpg" alt="Global Threat Index" width={3000} height={5000} />
        </div>
      </section>
    </div>
  );
} 