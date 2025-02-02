"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { use } from 'react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from 'lucide-react';
import { PencilIcon } from 'lucide-react';
import { CodeIcon, TagIcon } from 'lucide-react';
import { Trash2Icon } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

interface Product {
    id: string;
    name: string;
    description: string;
    cleanDescription?: string;
    technologies: string[];
    tags: string[];
    status: 'safe' | 'warning' | 'danger';
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [chatMessage, setChatMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([]);
    const [newStatus, setNewStatus] = useState<'safe' | 'warning' | 'danger' | null>(null);
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProduct, setEditedProduct] = useState<Partial<Product>>({});

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/products/${id}`, {
                withCredentials: true
            });
            
            const productData = response.data.product;
            
            setProduct({
                id: productData._id,
                name: productData.name,
                description: productData.description,
                cleanDescription: productData.cleanDescription,
                technologies: productData.technologies,
                tags: productData.tags,
                status: productData.status || 'safe'
            });
            setLoading(false);
        } catch (err) {
            console.error('Error fetching product:', err);
            setError('Failed to load product');
            setLoading(false);
        }
    };

    const handleChat = async () => {
        if (!chatMessage.trim()) return;

        try {
            const response = await axios.post(
                `http://localhost:3001/api/products/${id}/chat`,
                { message: chatMessage },
                { withCredentials: true }
            );

            setChatHistory(prev => [...prev, 
                { role: 'user', content: chatMessage },
                { role: 'assistant', content: response.data.response }
            ]);
            setChatMessage('');
        } catch (err) {
            setError('Failed to send message');
        }
    };

    const handleStatusChange = async () => {
        if (!newStatus || !product) return;

        try {
            await axios.put(
                `http://localhost:3001/api/products/${id}`,
                { status: newStatus },
                { withCredentials: true }
            );
            
            setProduct({ ...product, status: newStatus });
            setShowStatusDialog(false);
            toast.success('Status updated successfully');
        } catch (err) {
            toast.error('Failed to update status');
            setError('Failed to update status');
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:3001/api/products/${id}`, {
                withCredentials: true
            });
            toast.success('Product deleted successfully');
            router.push('/dashboard');
        } catch (err) {
            toast.error('Failed to delete product');
            setError('Failed to delete product');
        }
    };

    const handleUpdate = async () => {
        if (!editedProduct || !product) return;

        try {
            const response = await axios.put(
                `http://localhost:3001/api/products/${id}`,
                editedProduct,
                { withCredentials: true }
            );
            
            setProduct({ ...product, ...editedProduct });
            setIsEditing(false);
        } catch (err) {
            setError('Failed to update product');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!product) return <div>Product not found</div>;

    return (
        <div className="container max-w-5xl mx-auto px-4 py-8">
            {/* Back Button and Actions */}
            <div className="flex justify-between items-center mb-6">
                <Button 
                    variant="ghost" 
                    onClick={() => router.push('/dashboard')}
                    className="hover:bg-background/60"
                >
                    ← Back to Products
                </Button>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/products/edit/${id}`)}
                    >
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Edit Product
                    </Button>
                    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <Button
                            variant="destructive"
                            onClick={() => setShowDeleteDialog(true)}
                        >
                            <Trash2Icon className="h-4 w-4 mr-2" />
                            Delete Product
                        </Button>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the product
                                    and all associated data.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Product Details Card */}
                <Card className="border-none shadow-lg">
                    <CardHeader className="space-y-1 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedProduct.name || product.name}
                                        onChange={(e) => setEditedProduct({
                                            ...editedProduct,
                                            name: e.target.value
                                        })}
                                        className="text-4xl font-bold tracking-tight bg-transparent border-b border-border px-1 focus:outline-none focus:border-primary"
                                    />
                                ) : (
                                    <h1 className="text-4xl font-bold tracking-tight">{product.name}</h1>
                                )}
                                <p className="text-base text-muted-foreground mt-2">Product Details and Security Status</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 bg-background/95 px-4 py-2.5 rounded-full border shadow-sm">
                                    <div 
                                        className={`h-2.5 w-2.5 rounded-full ${
                                            product.status === 'safe' ? 'bg-green-500 shadow-green-500/50' :
                                            product.status === 'warning' ? 'bg-yellow-500 shadow-yellow-500/50' :
                                            'bg-red-500 shadow-red-500/50'
                                        } shadow-[0_0_8px] animate-pulse`}
                                    />
                                    <span className="capitalize text-base font-medium">{product.status}</span>
                                    <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
                                        <DialogTrigger asChild>
                                            <Button 
                                                size="sm"
                                                variant="ghost"
                                                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                                            >
                                                <PencilIcon className="h-3.5 w-3.5" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>Update Security Status</DialogTitle>
                                                <DialogDescription>
                                                    Choose a new security status for this product. This will be visible to all team members.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="p-4 bg-muted/50 rounded-lg">
                                                <RadioGroup
                                                    value={newStatus || product.status}
                                                    onValueChange={(value: 'safe' | 'warning' | 'danger') => setNewStatus(value)}
                                                    className="flex flex-col space-y-4"
                                                >
                                                    {[
                                                        { value: 'safe', color: 'bg-green-500', label: 'Safe - No known security issues' },
                                                        { value: 'warning', color: 'bg-yellow-500', label: 'Warning - Potential security concerns' },
                                                        { value: 'danger', color: 'bg-red-500', label: 'Danger - Critical security issues' }
                                                    ].map(({ value, color, label }) => (
                                                        <div key={value} className="flex items-center space-x-3 p-2 rounded hover:bg-muted">
                                                            <RadioGroupItem value={value} id={`status-${value}`} />
                                                            <label htmlFor={`status-${value}`} className="flex items-center gap-2 cursor-pointer">
                                                                <span className={`h-3 w-3 rounded-full ${color}`} />
                                                                <div>
                                                                    <p className="font-medium capitalize">{value}</p>
                                                                    <p className="text-sm text-muted-foreground">{label}</p>
                                                                </div>
                                                            </label>
                                                        </div>
                                                    ))}
                                                </RadioGroup>
                                            </div>
                                            <div className="flex justify-end gap-3">
                                                <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                                                    Cancel
                                                </Button>
                                                <Button onClick={handleStatusChange}>
                                                    Confirm Change
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Description Section */}
                        <div className="space-y-4">
                            <div className="pb-4">
                                <h3 className="text-2xl font-semibold mb-4">Description</h3>
                                {isEditing ? (
                                    <textarea
                                        value={editedProduct.description || product.description}
                                        onChange={(e) => setEditedProduct({
                                            ...editedProduct,
                                            description: e.target.value
                                        })}
                                        className="w-full min-h-[150px] text-lg text-muted-foreground leading-relaxed bg-muted/30 rounded-lg p-4 border focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                ) : (
                                    <p className="text-lg text-muted-foreground leading-relaxed">
                                        {product.description}
                                    </p>
                                )}
                            </div>

                            {/* AI Understanding Collapsible */}
                            {product.cleanDescription && (
                                <Collapsible className="w-full">
                                    <CollapsibleTrigger className="flex items-center gap-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors group w-full">
                                        <ChevronDown className="h-5 w-5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                        <span>Want to know how our AI understood your product?</span>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="mt-4">
                                        <div className="bg-muted/30 p-6 rounded-lg border">
                                            <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-wrap">
                                                {product.cleanDescription}
                                            </p>
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            )}
                        </div>

                        {/* Technologies & Tags Section */}
                        <div className="grid gap-8 sm:grid-cols-2">
                            {/* Technologies */}
                            {product.technologies && product.technologies.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-xl font-semibold flex items-center gap-2">
                                        <CodeIcon className="h-5 w-5 text-muted-foreground" />
                                        Technologies
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {product.technologies.map((tech, index) => (
                                            <Badge 
                                                key={`tech-${index}-${tech}`}
                                                className="px-3 py-1.5 text-base font-medium hover:bg-secondary/80 transition-colors"
                                            >
                                                {tech}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tags */}
                            {product.tags && product.tags.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-xl font-semibold flex items-center gap-2">
                                        <TagIcon className="h-5 w-5 text-muted-foreground" />
                                        Tags
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {product.tags.map((tag, index) => (
                                            <Badge 
                                                key={`tag-${index}-${tag}`}
                                                variant="outline"
                                                className="px-3 py-1.5 text-base font-medium hover:bg-muted/50 transition-colors"
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {isEditing && (
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate}>
                            Save Changes
                        </Button>
                    </div>
                )}

                {/* Chat Card */}
                <Card className="border-none shadow-lg">
                    <CardHeader>
                        <h2 className="text-2xl font-semibold">Security Assistant</h2>
                        <p className="text-base text-muted-foreground">
                            Chat with our AI to analyze security concerns and get recommendations
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="h-[400px] overflow-y-auto border rounded-lg p-4 space-y-4 bg-muted/30">
                                {chatHistory.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center gap-4 text-muted-foreground p-4">
                                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                                            <AlertCircle className="w-8 h-8" />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="font-medium mb-1">No messages yet</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Start a conversation by asking about potential security concerns.
                                            </p>
                                        </div>
                                        <div className="max-w-sm text-sm text-center">
                                            Try asking:
                                            <ul className="mt-2 space-y-1">
                                                <li>"What are the potential security risks?"</li>
                                                <li>"How can I improve authentication?"</li>
                                                <li>"Are there any vulnerabilities in the technologies used?"</li>
                                            </ul>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {chatHistory.map((msg, index) => (
                                            <div
                                                key={index}
                                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[80%] p-3 rounded-lg ${
                                                        msg.role === 'user'
                                                            ? 'bg-primary text-primary-foreground ml-4'
                                                            : 'bg-muted mr-4'
                                                    }`}
                                                >
                                                    {msg.content}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={chatMessage}
                                        onChange={(e) => setChatMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                                        placeholder="Ask about security concerns..."
                                        className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary pr-20"
                                    />
                                    <Button 
                                        onClick={handleChat}
                                        className="absolute right-1 top-1 bottom-1"
                                        disabled={!chatMessage.trim()}
                                    >
                                        Send
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 