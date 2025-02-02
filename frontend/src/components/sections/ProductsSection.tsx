"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Code as CodeIcon, Tag as TagIcon } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface Product {
    id: string;
    name: string;
    description: string;
    technologies: string[];
    tags: string[];
    status?: 'safe' | 'warning' | 'danger';
}

const ProductsSection = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const router = useRouter();

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/products', {
                withCredentials: true
            });
            
            const productsData = response.data.products || [];
            
            // Transform the data to match our Product interface
            const transformedProducts = productsData.map((item: any) => ({
                id: item._id,
                name: item.name,
                description: item.description,
                technologies: item.technologies || [],
                tags: item.tags || [],
                status: item.status || 'safe'
            }));
            
            setProducts(transformedProducts);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError(error instanceof Error ? error : new Error('An error occurred'));
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleProductClick = (productId: string) => {
        router.push(`/products/${productId}`);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error.message}</div>;

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Products</h2>
                <Link 
                    href="/add-product"
                    className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    + New Product
                </Link>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide min-h-0">
                <div className="space-y-4">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <div 
                                key={product.id} 
                                className="p-6 rounded-lg border bg-background hover:bg-accent transition-colors cursor-pointer relative"
                                onClick={() => handleProductClick(product.id)}
                            >
                                {/* Status Indicator */}
                                <div className="absolute top-4 right-4">
                                    <div 
                                        className={`h-3 w-3 rounded-full ${
                                            product.status === 'safe' ? 'bg-green-500' :
                                            product.status === 'warning' ? 'bg-yellow-500' :
                                            'bg-red-500'
                                        }`}
                                    />
                                </div>

                                {/* Title and Description */}
                                <div className="mb-4 pr-8">
                                    <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                                    <p className="text-muted-foreground">
                                        {product.description}
                                    </p>
                                </div>

                                {/* Technologies and Tags */}
                                <div className="space-y-3">
                                    {/* Technologies */}
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                            <CodeIcon className="h-4 w-4" />
                                            Technologies
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {product.technologies.map((tech, index) => (
                                                <Badge 
                                                    key={index}
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {tech}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                            <TagIcon className="h-4 w-4" />
                                            Tags
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {product.tags.map((tag, index) => (
                                                <Badge 
                                                    key={index}
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground p-4">
                            No products found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductsSection; 