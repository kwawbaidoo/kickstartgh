"use client";

import { LayoutGrid, List } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type CardListView = "card" | "list";

type ViewToggleProps = {
  value: CardListView;
  onChange: (view: CardListView) => void;
};

function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <Tabs value={value} onValueChange={(next) => onChange(next as CardListView)}>
      <TabsList>
        <TabsTrigger value="card" aria-label="Card view">
          <LayoutGrid className="size-4" />
        </TabsTrigger>
        <TabsTrigger value="list" aria-label="List view">
          <List className="size-4" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export { ViewToggle };
