"use client"
import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  category: string;
  timestamp: string;
}

const NewsSection = () => {
    const router = useRouter();
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchNews = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/news`, {
                withCredentials: true
            });
            
            // Log the entire response
            console.log('Full API Response:', response);
            console.log('Response Data:', response.data);
            console.log('News Items:', response.data.data);
            
            // Log sample news item to see its structure
            if (response.data.data && response.data.data.length > 0) {
                console.log('Sample News Item Structure:', response.data.data[0]);
            }
            
            const newsData = response.data.data || [];
            
            // Log before deduplication
            console.log('Number of items before deduplication:', newsData.length);
            
            // Create a Map to store unique news items using _id (since that's what the API uses)
            const uniqueNewsMap = new Map();
            
            newsData.forEach((item: any) => {
                if (!uniqueNewsMap.has(item._id)) {
                    // Transform the item to match our NewsItem interface
                    const transformedItem: NewsItem = {
                        id: item._id,
                        title: item.title,
                        description: item.description,
                        category: item.threatLevel || 'Unknown',
                        timestamp: item.created
                    };
                    uniqueNewsMap.set(item._id, transformedItem);
                }
            });
            
            const uniqueNews = Array.from(uniqueNewsMap.values());
            
            // Log after deduplication
            console.log('Number of items after deduplication:', uniqueNews.length);
            console.log('First few unique items:', uniqueNews.slice(0, 3));
            
            // Sort news by timestamp
            const sortedNews = uniqueNews.sort((a, b) => 
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
            
            setNews(sortedNews);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching news:', error);
            setError(error instanceof Error ? error : new Error('An error occurred'));
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchNews();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error.message}</div>;

    const filteredNews = news.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleNewsClick = (newsId: string) => {
        router.push(`/news/${newsId}`);
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-2xl font-semibold mb-4">Latest Threats</h2>
            <div className="flex flex-col flex-1 min-h-0">
                <div className="relative mb-4">
                    <Input
                        type="search"
                        placeholder="Search news..."
                        className="w-full px-4 py-2 rounded-md border bg-background"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <svg 
                        className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                        />
                    </svg>
                </div>
                
                {/* Scrollable News Container */}
                <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                    <div className="space-y-4">
                        {filteredNews.length > 0 ? (
                            filteredNews.map((item) => (
                                <div 
                                    key={item.id}
                                    onClick={() => handleNewsClick(item.id)}
                                    className="p-4 rounded-lg border bg-background hover:bg-accent transition-colors cursor-pointer"
                                >
                                    <h3 className="font-medium">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                        {item.description}
                                    </p>
                                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                                        <span>{new Date(item.timestamp).toLocaleString()}</span>
                                        <span>•</span>
                                        <span>{item.category}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground p-4">
                                No news articles found
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NewsSection;