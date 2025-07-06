'use client';

import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function CreateCollectionPage() {
    const [collectionName, setCollectionName] = useState("");
    const [collectionDescription, setCollectionDescription] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!collectionName.trim()) {
            toast.error("Collection name is required");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/collections', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: collectionName.trim(),
                    description: collectionDescription.trim() || null,
                    is_public: isPublic,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create collection');
            }

            const data = await response.json();
            toast.success("Collection created successfully!");
            
            // Redirect to the new collection page
            // The API returns the collection data directly as an array
            const newCollectionId = data[0].id;
            router.push(`/collections/${newCollectionId}`);
        } catch (error) {
            console.error('Error creating collection:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create collection');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Create Collection</h1>
                
                <Card>
                    <CardHeader>
                        <CardTitle>New Collection</CardTitle>
                        <CardDescription>
                            Create a new collection to organize your recipes
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Collection Name *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={collectionName}
                                    onChange={(e) => setCollectionName(e.target.value)}
                                    placeholder="Enter collection name"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={collectionDescription}
                                    onChange={(e) => setCollectionDescription(e.target.value)}
                                    placeholder="Enter collection description (optional)"
                                    rows={4}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isPublic"
                                    checked={isPublic}
                                    onCheckedChange={(checked) => setIsPublic(checked as boolean)}
                                    disabled={isSubmitting}
                                />
                                <Label htmlFor="isPublic" className="text-sm font-normal cursor-pointer">
                                    Make this collection public
                                </Label>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !collectionName.trim()}
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Collection'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push('/collections')}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}