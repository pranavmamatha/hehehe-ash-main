"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { use } from 'react';
import { toast } from 'sonner';

interface Product {
    id: string;
    name: string;
    description: string;
    technologies: string[];
    tags: string[];
    status: 'safe' | 'warning' | 'danger';
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        description: '',
        technologies: [],
        tags: [],
    });
    const [techInput, setTechInput] = useState('');
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/products/${id}`, {
                withCredentials: true
            });
            
            const productData = response.data.product;
            setFormData({
                name: productData.name,
                description: productData.description,
                technologies: productData.technologies,
                tags: productData.tags,
            });
            setLoading(false);
        } catch (err) {
            console.error('Error fetching product:', err);
            setError('Failed to load product');
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.put(
                `http://localhost:3001/api/products/${id}`,
                formData,
                { withCredentials: true }
            );
            toast.success('Product updated successfully');
            router.push(`/products/${id}`);
        } catch (err) {
            toast.error('Failed to update product');
            setError('Failed to update product');
        }
    };

    const addTechnology = () => {
        if (techInput.trim() && !formData.technologies?.includes(techInput.trim())) {
            setFormData(prev => ({
                ...prev,
                technologies: [...(prev.technologies || []), techInput.trim()]
            }));
            setTechInput('');
        }
    };

    const removeTechnology = (tech: string) => {
        setFormData(prev => ({
            ...prev,
            technologies: prev.technologies?.filter(t => t !== tech) || []
        }));
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...(prev.tags || []), tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags?.filter(t => t !== tag) || []
        }));
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="container max-w-4xl mx-auto px-4 py-8">
            <Button 
                variant="ghost" 
                onClick={() => router.push(`/products/${id}`)}
                className="mb-6"
            >
                ← Back to Product
            </Button>

            <Card>
                <CardHeader>
                    <h1 className="text-3xl font-bold">Edit Product</h1>
                    <p className="text-muted-foreground">Update your product details</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">
                                Product Name
                            </label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter product name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium">
                                Description
                            </label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe your product..."
                                required
                                className="min-h-[150px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Technologies</label>
                            <div className="flex gap-2">
                                <Input
                                    value={techInput}
                                    onChange={(e) => setTechInput(e.target.value)}
                                    placeholder="Add technology..."
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                                />
                                <Button type="button" onClick={addTechnology}>
                                    Add
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.technologies?.map((tech) => (
                                    <span
                                        key={tech}
                                        className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                    >
                                        {tech}
                                        <button
                                            type="button"
                                            onClick={() => removeTechnology(tech)}
                                            className="hover:text-destructive"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tags</label>
                            <div className="flex gap-2">
                                <Input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    placeholder="Add tag..."
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                />
                                <Button type="button" onClick={addTag}>
                                    Add
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.tags?.map((tag) => (
                                    <span
                                        key={tag}
                                        className="border border-border px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="hover:text-destructive"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push(`/products/${id}`)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                Update Product
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
} 