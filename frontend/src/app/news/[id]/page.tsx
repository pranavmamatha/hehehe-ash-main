"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import axios from "axios"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface NewsItem {
  _id: string;
  title: string;
  description: string;
  threatLevel: string;
  created: string;
  tags: string[];
  content?: string;
}

const NewsDetailPage = () => {
  const params = useParams()
  const [news, setNews] = useState<NewsItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/news/${params.id}`, {
          withCredentials: true
        });
        setNews(response.data.data);
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch news'));
        setLoading(false)
      }
    }

    fetchNews()
  }, [params.id])

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">Error: {error.message}</div>
  if (!news) return <div className="flex justify-center items-center min-h-screen">News not found</div>

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="bg-background">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{news.threatLevel}</Badge>
            <span className="text-sm text-muted-foreground">
              {new Date(news.created).toLocaleString()}
            </span>
          </div>
          <h1 className="text-3xl font-bold">{news.title}</h1>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-invert max-w-none">
            <p className="text-lg leading-relaxed">{news.description}</p>
            {news.content && (
              <div className="mt-6">
                <p className="leading-relaxed">{news.content}</p>
              </div>
            )}
          </div>
          
          {news.tags && news.tags.length > 0 && (
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-3">Related Tags</h3>
              <div className="flex gap-2 flex-wrap">
                {news.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default NewsDetailPage
