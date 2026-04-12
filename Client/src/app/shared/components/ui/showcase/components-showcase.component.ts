import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent, CardFooterComponent } from '../card/card.component';
import { BadgeComponent } from '../badge/badge.component';
import { InputComponent } from '../input/input.component';
import { AvatarComponent, AvatarImageComponent, AvatarFallbackComponent } from '../avatar/avatar.component';

@Component({
  selector: 'app-components-showcase',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    CardFooterComponent,
    BadgeComponent,
    InputComponent,
    AvatarComponent,
    AvatarImageComponent,
    AvatarFallbackComponent,
  ],
  template: `
    <div class="min-h-screen bg-background text-foreground p-8">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-4xl font-bold mb-2">Component Showcase</h1>
        <p class="text-muted-foreground mb-8">A collection of all available UI components</p>

        <!-- Buttons Section -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold mb-6 mt-8">Buttons</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Default Buttons -->
            <div appCard>
              <div appCardHeader>
                <h3 appCardTitle>Button Variants</h3>
                <p appCardDescription>Different button styles for various use cases</p>
              </div>
              <div appCardContent class="space-y-3">
                <button appButton variant="default">Default</button>
                <button appButton variant="secondary">Secondary</button>
                <button appButton variant="destructive">Destructive</button>
                <button appButton variant="outline">Outline</button>
                <button appButton variant="ghost">Ghost</button>
                <button appButton variant="link">Link</button>
              </div>
            </div>

            <!-- Button Sizes -->
            <div appCard>
              <div appCardHeader>
                <h3 appCardTitle>Button Sizes</h3>
                <p appCardDescription>Different button sizes for different contexts</p>
              </div>
              <div appCardContent class="space-y-3">
                <button appButton size="sm">Small</button>
                <button appButton size="default">Default</button>
                <button appButton size="lg">Large</button>
                <button appButton size="icon">+</button>
              </div>
            </div>
          </div>
        </section>

        <!-- Badges Section -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold mb-6 mt-8">Badges</h2>

          <div appCard>
            <div appCardHeader>
              <h3 appCardTitle>Badge Variants</h3>
              <p appCardDescription>Use badges to label, categorize, or indicate status</p>
            </div>
            <div appCardContent>
              <div class="flex flex-wrap gap-2">
                <span appBadge variant="default">Default</span>
                <span appBadge variant="secondary">Secondary</span>
                <span appBadge variant="destructive">Destructive</span>
                <span appBadge variant="outline">Outline</span>
                <span appBadge variant="default">Active</span>
                <span appBadge variant="secondary">Pending</span>
                <span appBadge variant="destructive">Error</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Cards Section -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold mb-6 mt-8">Cards</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Product Card Example -->
            <div appCard>
              <div appCardHeader>
                <h3 appCardTitle>Product Card</h3>
                <p appCardDescription>A product listing card</p>
              </div>
              <div appCardContent class="space-y-4">
                <div class="flex items-center gap-4">
                  <div class="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                    <span class="text-2xl">📦</span>
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold">Product Name</p>
                    <p class="text-sm text-muted-foreground">Product description</p>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-lg font-bold">$99.99</span>
                  <span appBadge variant="secondary">In Stock</span>
                </div>
              </div>
              <div appCardFooter class="gap-2">
                <button appButton variant="default" size="sm" class="flex-1">Add to Cart</button>
                <button appButton variant="outline" size="sm" class="flex-1">View</button>
              </div>
            </div>

            <!-- User Card Example -->
            <div appCard>
              <div appCardHeader>
                <h3 appCardTitle>User Card</h3>
                <p appCardDescription>A user profile card</p>
              </div>
              <div appCardContent class="space-y-4">
                <div class="flex items-center gap-4">
                  <div appAvatar size="lg">
                    <span appAvatarFallback class="font-bold">JD</span>
                  </div>
                  <div>
                    <p class="font-semibold">John Doe</p>
                      <p class="text-sm text-muted-foreground">john&#64;example.com</p>
                    <span appBadge variant="default" class="mt-2 inline-block">Admin</span>
                  </div>
                </div>
              </div>
              <div appCardFooter class="gap-2">
                <button appButton variant="outline" size="sm" class="flex-1">Edit</button>
                <button appButton variant="destructive" size="sm" class="flex-1">Remove</button>
              </div>
            </div>
          </div>
        </section>

        <!-- Inputs Section -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold mb-6 mt-8">Inputs</h2>

          <div appCard>
            <div appCardHeader>
              <h3 appCardTitle>Input Types</h3>
              <p appCardDescription>Various input field types</p>
            </div>
            <div appCardContent class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1">Text Input</label>
                <input appInput type="text" placeholder="Enter text..." />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Email Input</label>
                <input appInput type="email" placeholder="Enter email..." />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Password Input</label>
                <input appInput type="password" placeholder="Enter password..." />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Disabled Input</label>
                <input appInput type="text" placeholder="Disabled" [disabled]="true" />
              </div>
            </div>
          </div>
        </section>

        <!-- Avatars Section -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold mb-6 mt-8">Avatars</h2>

          <div appCard>
            <div appCardHeader>
              <h3 appCardTitle>Avatar Sizes</h3>
              <p appCardDescription>Avatar component in different sizes</p>
            </div>
            <div appCardContent>
              <div class="flex items-center gap-6">
                <div appAvatar size="sm">
                  <span appAvatarFallback>SM</span>
                </div>
                <div appAvatar size="md">
                  <span appAvatarFallback>MD</span>
                </div>
                <div appAvatar size="lg">
                  <span appAvatarFallback>LG</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Color System Section -->
        <section class="mb-12">
          <h2 class="text-2xl font-semibold mb-6 mt-8">Color System</h2>

          <div appCard>
            <div appCardHeader>
              <h3 appCardTitle>Semantic Colors</h3>
              <p appCardDescription>The color palette used throughout the application</p>
            </div>
            <div appCardContent>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div class="w-full h-24 bg-primary rounded-md mb-2"></div>
                  <p class="font-semibold text-sm">Primary</p>
                </div>
                <div>
                  <div class="w-full h-24 bg-secondary rounded-md mb-2"></div>
                  <p class="font-semibold text-sm">Secondary</p>
                </div>
                <div>
                  <div class="w-full h-24 bg-accent rounded-md mb-2"></div>
                  <p class="font-semibold text-sm">Accent</p>
                </div>
                <div>
                  <div class="w-full h-24 bg-destructive rounded-md mb-2"></div>
                  <p class="font-semibold text-sm">Destructive</p>
                </div>
                <div>
                  <div class="w-full h-24 bg-muted rounded-md mb-2 border border-border"></div>
                  <p class="font-semibold text-sm">Muted</p>
                </div>
                <div>
                  <div class="w-full h-24 bg-card rounded-md mb-2 border border-border"></div>
                  <p class="font-semibold text-sm">Card</p>
                </div>
                <div>
                  <div class="w-full h-24 bg-background rounded-md mb-2 border border-border"></div>
                  <p class="font-semibold text-sm">Background</p>
                </div>
                <div>
                  <div class="w-full h-24 bg-foreground rounded-md mb-2"></div>
                  <p class="font-semibold text-sm text-background">Foreground</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
})
export class ComponentsShowcaseComponent {}
