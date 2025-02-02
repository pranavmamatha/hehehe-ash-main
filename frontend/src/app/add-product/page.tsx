"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, X } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const Page = () => {
  const router = useRouter();
  const [product, setProduct] = useState({
    name: '',
    description: '',
    technologies: '',
    tags: '',
    status: 'safe'
  });
  const [error, setError] = useState('');

  const getTags = () => product.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
  const getTechnologies = () => product.technologies.split(',').map(tech => tech.trim()).filter(tech => tech);

  const removeTag = (tagToRemove: string) => {
    const newTags = getTags().filter(tag => tag !== tagToRemove);
    setProduct({ ...product, tags: newTags.join(', ') });
  };

  const removeTechnology = (techToRemove: string) => {
    const newTechs = getTechnologies().filter(tech => tech !== techToRemove);
    setProduct({ ...product, technologies: newTechs.join(', ') });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const tagsArray = getTags();
    if (tagsArray.length < 4) {
      setError('Please add at least 4 tags');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...product,
          technologies: getTechnologies(),
          tags: tagsArray,
        }),
      });
      
      if (response.ok) {
        router.push('/dashboard');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to create product');
      }
    } catch (error) {
      console.error('Failed to create product:', error);
      setError('Failed to create product. Please try again.');
    }
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <Card className="border-none shadow-lg">
        <CardHeader className="space-y-1">
          <h1 className="text-2xl font-bold">Add New Product</h1>
          <p className="text-sm text-muted-foreground">
            Create a new product with details about your project
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/15 text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Name</label>
              <Input
                value={product.name}
                onChange={(e) => setProduct({...product, name: e.target.value})}
                placeholder="Enter product name"
                className="h-11"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={product.description}
                onChange={(e) => setProduct({...product, description: e.target.value})}
                placeholder="Describe your product..."
                className="min-h-[120px] resize-none"
                required
              />
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium">Technologies</label>
              <Input
                value={product.technologies}
                onChange={(e) => setProduct({...product, technologies: e.target.value})}
                placeholder="React, Node.js, MongoDB (comma-separated)"
                className="h-11"
                required
              />
              {getTechnologies().length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {getTechnologies().map((tech, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="px-3 py-1 flex items-center gap-1"
                    >
                      {tech}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
                        onClick={() => removeTechnology(tech)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Tags</label>
                <span className="text-xs text-muted-foreground">
                  {getTags().length}/4 minimum tags
                </span>
              </div>
              <Input
                value={product.tags}
                onChange={(e) => setProduct({...product, tags: e.target.value})}
                placeholder="web, mobile, desktop, security (comma-separated)"
                className={`h-11 ${getTags().length < 4 ? 'border-orange-500 focus-visible:ring-orange-500' : 'border-green-500 focus-visible:ring-green-500'}`}
                required
              />
              {getTags().length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {getTags().map((tag, index) => (
                    <Badge 
                      key={index}
                      variant="outline"
                      className="px-3 py-1 flex items-center gap-1"
                    >
                      {tag}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Status</label>
              <RadioGroup
                defaultValue={product.status}
                onValueChange={(value) => setProduct({...product, status: value})}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="safe" id="safe" />
                  <label htmlFor="safe" className="flex items-center">
                    <span className="h-3 w-3 rounded-full bg-green-500 mr-2" />
                    Safe
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="warning" id="warning" />
                  <label htmlFor="warning" className="flex items-center">
                    <span className="h-3 w-3 rounded-full bg-yellow-500 mr-2" />
                    Warning
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="danger" id="danger" />
                  <label htmlFor="danger" className="flex items-center">
                    <span className="h-3 w-3 rounded-full bg-red-500 mr-2" />
                    Danger
                  </label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/dashboard')}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="px-8"
              >
                Create Product
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
