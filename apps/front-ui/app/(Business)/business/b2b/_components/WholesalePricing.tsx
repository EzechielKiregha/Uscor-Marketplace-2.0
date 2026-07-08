"use client";

import { useMutation, useQuery } from "@apollo/client";
import {
    DollarSign,
    Package,
    Plus,
    Tag,
    Trash2,
    X,
} from "lucide-react";
import { useState } from "react";
import EmptyState, { emptyStateIcons } from "@/components/EmptyState";
import { MotionStagger, MotionStaggerItem } from "@/components/MotionStagger";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    CREATE_WHOLESALE_PRICE,
    DELETE_WHOLESALE_PRICE,
    GET_MY_WHOLESALE_PRICES
} from "@/graphql/b2b.gql";

interface Props {
	products: any[];
}

export default function WholesalePricing({ products }: Props) {
	const [showForm, setShowForm] = useState(false);
	const [form, setForm] = useState({
		productId: "",
		minQuantity: "",
		price: "",
		maxQuantity: "",
	});
	const { showToast } = useToast();

	const { data, loading, refetch } = useQuery(GET_MY_WHOLESALE_PRICES);
	const [createPrice, { loading: creating }] = useMutation(CREATE_WHOLESALE_PRICE);
	const [deletePrice] = useMutation(DELETE_WHOLESALE_PRICE);

	const wholesalePrices = data?.myWholesalePrices || [];

	const handleCreate = async () => {
		if (!form.productId || !form.minQuantity || !form.price) {
			showToast("error", "Error", "Product, minimum quantity, and price are required");
			return;
		}
		try {
			await createPrice({
				variables: {
					input: {
						productId: form.productId,
						minQuantity: parseInt(form.minQuantity),
						price: parseFloat(form.price),
						maxQuantity: form.maxQuantity ? parseInt(form.maxQuantity) : undefined,
					},
				},
			});
			showToast("success", "Success", "Wholesale price tier created");
			setForm({ productId: "", minQuantity: "", price: "", maxQuantity: "" });
			setShowForm(false);
			refetch();
		} catch (err: any) {
			showToast("error", "Error", err.message);
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Delete this wholesale price tier?")) return;
		try {
			await deletePrice({ variables: { id } });
			showToast("success", "Deleted", "Price tier removed");
			refetch();
		} catch (err: any) {
			showToast("error", "Error", err.message);
		}
	};

	if (loading) return <TableSkeleton />;

	// Group by product
	const grouped = wholesalePrices.reduce((acc: any, wp: any) => {
		const key = wp.product?.title || wp.productId;
		if (!acc[key]) acc[key] = { product: wp.product, tiers: [] };
		acc[key].tiers.push(wp);
		return acc;
	}, {});

	return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-section-title flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Wholesale Pricing
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Set volume-based pricing tiers for B2B buyers
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            <X className="h-4 w-4 mr-1" />
          ) : (
            <Plus className="h-4 w-4 mr-1" />
          )}
          {showForm ? "Cancel" : "Add Tier"}
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          <h3 className="text-section-subtitle">New Wholesale Price Tier</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Product
              </label>
              <select
                value={form.productId}
                onChange={(e) =>
                  setForm({ ...form, productId: e.target.value })
                }
                className="w-full p-2 border border-border rounded-md bg-background text-sm"
              >
                <option value="">Select product...</option>
                {products.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.title} (${p.price})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Min Qty
              </label>
              <Input
                type="number"
                placeholder="e.g. 10"
                value={form.minQuantity}
                onChange={(e) =>
                  setForm({ ...form, minQuantity: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Wholesale Price (per unit)
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g. 8.50"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Max Qty (optional)
              </label>
              <Input
                type="number"
                placeholder="e.g. 99"
                value={form.maxQuantity}
                onChange={(e) =>
                  setForm({ ...form, maxQuantity: e.target.value })
                }
              />
            </div>
          </div>
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? "Creating..." : "Create Tier"}
          </Button>
        </div>
      )}

      {/* Price tiers list */}
      {Object.keys(grouped).length === 0 ? (
        <EmptyState
          icon={emptyStateIcons.products}
          title="No wholesale prices yet"
          description="Add volume-based pricing tiers for your products to attract B2B buyers"
          action={{
            label: "Add Price Tier",
            onClick: () => setShowForm(true),
          }}
        />
      ) : (
        <MotionStagger className="space-y-4">
          {Object.entries(grouped).map(
            ([productTitle, group]: [string, any]) => (
              <MotionStaggerItem key={productTitle}>
                <div className="bg-card border border-border rounded-lg overflow-hidden card-hover">
                  <div className="p-4 bg-muted border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{productTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          Retail: ${group.product?.price?.toFixed(2)} &middot;
                          Stock: {group.product?.stock}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {group.tiers.length} tier
                      {group.tiers.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="divide-y divide-border">
                    {group.tiers
                      .sort((a: any, b: any) => a.minQuantity - b.minQuantity)
                      .map((tier: any) => {
                        const discount = group.product?.price
                          ? Math.round(
                              ((group.product.price - tier.price) /
                                group.product.price) *
                                100,
                            )
                          : 0;
                        return (
                          <div
                            key={tier.id}
                            className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">
                                  Qty:
                                </span>{" "}
                                <span className="font-medium">
                                  {tier.minQuantity}
                                  {tier.maxQuantity
                                    ? ` - ${tier.maxQuantity}`
                                    : "+"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3.5 w-3.5 text-primary" />
                                <span className="font-bold">
                                  {tier.price.toFixed(2)}
                                </span>
                              </div>
                              {discount > 0 && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-success/10 text-success border border-success/20">
                                  {discount}% off
                                </span>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(tier.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </MotionStaggerItem>
            ),
          )}
        </MotionStagger>
      )}
    </div>
  );
}
