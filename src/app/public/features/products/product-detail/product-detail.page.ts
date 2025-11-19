import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PublicProductService } from '../../../../services/public-product.service';
import type { PopulatedProduct, ProductVariant } from '@shared/models/product.model';
import { CartStore } from '../../cart/store/cart.store';
import { inject } from '@angular/core';
import { ProductCard } from '@shared/components/product-card/product-card';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, ProductCard],
  templateUrl: './product-detail.page.html',
  styleUrl: './product-detail.page.css',
})
export class ProductDetailPage implements OnInit {
  product?: PopulatedProduct;
  isLoading = true;
  errorMessage?: string;

  selectedVariant?: ProductVariant;
  selectedImage?: string;

  uniqueColors: string[] = [];
  availableTallas: string[] = [];

  selectedColor?: string;
  selectedTalla?: string;

  currentIndex = 0;

  relatedProducts: PopulatedProduct[] = [];

  store = inject(CartStore);


  constructor(
    private productService: PublicProductService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.errorMessage = 'No se especificó ningún producto.';
      this.isLoading = false;
      return;
    }

    this.productService.getProducts({ search: slug }).subscribe({
      next: (response) => {
        const foundProduct = response.data.find((p) => p.slug === slug);
        if (!foundProduct) {
          this.errorMessage = 'Producto no encontrado.';
          this.isLoading = false;
          return;
        }

        this.product = foundProduct;
        this.resetToDefaultImage();
        this.setupVariantSelectors();

        if (this.uniqueColors.length === 0) {
          this.populateTallasForColorlessVariants();
        }

        /** 👉 Cargar productos relacionados */
        this.loadRelatedProducts(foundProduct._id!);

        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar los detalles del producto.';
        this.isLoading = false;
        console.error(error);
      },
    });
  }


  /** Extrae colores únicos de las variantes */
  private setupVariantSelectors(): void {
    if (!this.product) return;

    const colors = new Set<string>();
    this.product.variants.forEach((v) => {
      const colorAttr = v.attributes.find((a) => a.key === 'Color');
      if (colorAttr?.value) colors.add(colorAttr.value);
    });
    this.uniqueColors = [...colors];
  }

  /** Selección de color */
  selectColor(color: string): void {
    if (this.selectedColor === color) {
      this.selectedColor = undefined;
      this.selectedTalla = undefined;
      this.populateTallasForColorlessVariants();
    } else {
      this.selectedColor = color;
      this.selectedTalla = undefined;
      this.populateTallasForSelectedColor();
    }
    this.updateSelectedVariant();
  }

  /** Tallas de variantes sin color */
  private populateTallasForColorlessVariants(): void {
    if (!this.product) return;
    const tallas = new Set<string>();
    this.product.variants.forEach((v) => {
      const hasColor = v.attributes.find((a) => a.key === 'Color');
      if (!hasColor) {
        const tallaAttr = v.attributes.find((a) => a.key === 'Talla');
        if (tallaAttr?.value) tallas.add(tallaAttr.value);
      }
    });
    this.availableTallas = [...tallas];
  }

  /** Tallas del color seleccionado */
  private populateTallasForSelectedColor(): void {
    if (!this.product || !this.selectedColor) return;

    const tallas = new Set<string>();
    this.product.variants.forEach((v) => {
      const hasColor = v.attributes.find(
        (a) => a.key === 'Color' && a.value === this.selectedColor
      );
      if (hasColor) {
        const tallaAttr = v.attributes.find((a) => a.key === 'Talla');
        if (tallaAttr?.value) tallas.add(tallaAttr.value);
      }
    });

    this.availableTallas = [...tallas];
    if (this.availableTallas.length === 1) {
      this.selectTalla(this.availableTallas[0]);
    }
  }

  /** Selección de talla */
  selectTalla(talla: string): void {
    this.selectedTalla = this.selectedTalla === talla ? undefined : talla;
    this.updateSelectedVariant();
  }

  /** Actualiza la variante seleccionada según color y talla */
  private updateSelectedVariant(): void {
    if (!this.product) return;

    this.selectedVariant = this.product.variants.find((v) => {
      const colorAttr = v.attributes.find((a) => a.key === 'Color');
      const colorMatch = this.selectedColor
        ? colorAttr?.value === this.selectedColor
        : !colorAttr;

      const tallaAttr = v.attributes.find((a) => a.key === 'Talla');
      const tallaMatch = this.selectedTalla
        ? tallaAttr?.value === this.selectedTalla
        : false;

      if (this.availableTallas.length === 0) return colorMatch;
      if (this.uniqueColors.length === 0) return tallaMatch;
      return colorMatch && tallaMatch;
    });

    this.updateUIForSelectedVariant();
  }

  /** Actualiza la imagen mostrada según la variante */
  private updateUIForSelectedVariant(): void {
    if (this.selectedVariant?.images?.length) {
      this.selectedImage = this.selectedVariant.images[0];
    } else {
      this.resetToDefaultImage();
    }
  }

  /** Imagen por defecto */
  private resetToDefaultImage(): void {
    const firstVariant = this.product?.variants?.[0];
    this.selectedImage = firstVariant?.images?.[0];
  }

  private loadRelatedProducts(productId: string): void {
    this.productService.getRelatedProducts(productId).subscribe({
      next: (products) => {
        /** Evitar incluir el mismo producto */
        this.relatedProducts = products.filter(p => p._id !== productId);
      },
      error: (err) => {
        console.error('Error al cargar productos relacionados:', err);
        this.relatedProducts = [];
      }
    });
  }


  /** Devuelve imágenes a mostrar (de la variante o combinadas) */
  getDisplayedImages(): string[] {
    if (this.selectedVariant?.images?.length) return this.selectedVariant.images;

    if (this.product?.variants?.length) {
      const allImages = this.product.variants
        .flatMap((v) => v.images || [])
        .filter((img, index, arr) => arr.indexOf(img) === index);
      return allImages;
    }

    return [];
  }

  /** Cambiar imagen manualmente */
  selectImage(image: string): void {
    this.selectedImage = image;
  }

  /** Verifica stock por talla */
  isOutOfStock(talla: string): boolean {
    const variant = this.product?.variants.find((v) => {
      const colorAttr = v.attributes.find((a) => a.key === 'Color');
      const colorMatch = this.selectedColor
        ? colorAttr?.value === this.selectedColor
        : !colorAttr;
      const tallaMatch =
        v.attributes.find((a) => a.key === 'Talla' && a.value === talla) !==
        undefined;
      return colorMatch && tallaMatch;
    });
    return variant ? variant.stock === 0 : true;
  }



  /** Añadir al carrito */

  addToCart(): void {
    if (!this.product || !this.selectedVariant) return;

    const variant: ProductVariant = this.selectedVariant;
    if (variant.stock <= 0) return;

    this.store.add({
      id: `${this.product._id}-${variant.sku}`,
      productId: this.product._id!,
      name: this.product.name,
      price: variant.salePrice ?? variant.price,
      image: this.selectedImage || '',
      qty: 1,
      variant: {
        sku: variant.sku,
        attributes: variant.attributes,
        price: variant.price,
        salePrice: variant.salePrice,
      },
    });
  }
  /** Navegación en carrusel */
  nextImage(): void {
    const total = this.getDisplayedImages().length;
    if (total > 0) this.currentIndex = (this.currentIndex + 1) % total;
  }

  prevImage(): void {
    const total = this.getDisplayedImages().length;
    if (total > 0) this.currentIndex = (this.currentIndex - 1 + total) % total;
  }
}
