import { PublicProductService } from '../../../../services/public-product.service';
import type {
  PopulatedProduct,
  ProductVariant,
} from '@shared/models/product.model';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule],
  templateUrl: './product-detail.page.html',
  styleUrl: './product-detail.page.css',
})
export class ProductDetailPage implements OnInit {
  product?: PopulatedProduct;
  isLoading = true;
  errorMessage?: string;

  // --- Propiedades para el manejo de variantes ---
  selectedVariant?: ProductVariant;
  selectedImage?: string;

  // Opciones de selección
  uniqueColors: string[] = [];
  availableTallas: string[] = []; // CAMBIADO: de availableSizes

  // Estado de selección actual
  selectedColor?: string;
  selectedTalla?: string; // CAMBIADO: de selectedSize
  // --- Fin de propiedades de variantes ---

  constructor(
    private productService: PublicProductService,
    private route: ActivatedRoute
  ) {}

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

        // Ya NO auto-seleccionamos la primera variante.
        // El usuario debe elegir.
        // Pero, si no hay colores, poblamos las tallas sin color.
        if (this.uniqueColors.length === 0) {
          this.populateTallasForColorlessVariants();
        }

        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar los detalles del producto.';
        this.isLoading = false;
        console.error(error);
      },
    });
  }

  /**
   * Extrae los colores únicos de todas las variantes.
   */
  private setupVariantSelectors(): void {
    if (!this.product) return;

    const colors = new Set<string>();
    this.product.variants.forEach((v) => {
      const colorAttr = v.attributes.find((a) => a.key === 'Color');
      if (colorAttr?.value) {
        colors.add(colorAttr.value);
      }
    });
    this.uniqueColors = [...colors];
  }

  /**
   * Se llama cuando el usuario hace clic en un color.
   * Permite seleccionar y deseleccionar.
   */
  selectColor(color: string): void {
    if (this.selectedColor === color) {
      // --- DESELECCIONAR COLOR ---
      this.selectedColor = undefined;
      this.selectedTalla = undefined;
      // Poblar tallas de variantes SIN color
      this.populateTallasForColorlessVariants();
    } else {
      // --- SELECCIONAR NUEVO COLOR ---
      this.selectedColor = color;
      this.selectedTalla = undefined;
      // Poblar tallas para el color seleccionado
      this.populateTallasForSelectedColor();
    }

    this.updateSelectedVariant();
  }

  /**
   * Helper para encontrar tallas de variantes SIN color.
   */
  private populateTallasForColorlessVariants(): void {
    if (!this.product) return;
    const tallas = new Set<string>();
    this.product.variants.forEach((v) => {
      const hasColor = v.attributes.find((a) => a.key === 'Color');
      // Solo nos interesan variantes SIN atributo de color
      if (!hasColor) {
        const tallaAttr = v.attributes.find((a) => a.key === 'Talla'); // CAMBIADO: key === 'Talla'
        if (tallaAttr?.value) {
          tallas.add(tallaAttr.value);
        }
      }
    });
    this.availableTallas = [...tallas];
  }

  /**
   * Helper para encontrar tallas para el color ELEGIDO.
   */
  private populateTallasForSelectedColor(): void {
    if (!this.product || !this.selectedColor) return;
    const tallas = new Set<string>();
    this.product.variants.forEach((v) => {
      const hasColor = v.attributes.find(
        (a) => a.key === 'Color' && a.value === this.selectedColor
      );
      // Solo nos interesan variantes CON el color seleccionado
      if (hasColor) {
        const tallaAttr = v.attributes.find((a) => a.key === 'Talla'); // CAMBIADO: key === 'Talla'
        if (tallaAttr?.value) {
          tallas.add(tallaAttr.value);
        }
      }
    });
    this.availableTallas = [...tallas];

    // Auto-selección si solo hay una talla
    if (this.availableTallas.length === 1) {
      this.selectTalla(this.availableTallas[0]);
    }
  }


  /**
   * Se llama cuando el usuario hace clic en una talla.
   * CAMBIADO: de selectSize a selectTalla
   */
  selectTalla(talla: string): void {
    if (this.selectedTalla === talla) {
      // --- DESELECCIONAR TALLA ---
      this.selectedTalla = undefined;
    } else {
      // --- SELECCIONAR NUEVA TALLA ---
      this.selectedTalla = talla;
    }
    this.updateSelectedVariant();
  }

  /**
   * Encuentra la variante específica que coincide con las selecciones
   * y actualiza la UI.
   * ESTA ES LA LÓGICA CLAVE MEJORADA.
   */
  private updateSelectedVariant(): void {
    if (!this.product) return;

    this.selectedVariant = this.product.variants.find((v) => {

      // Lógica de Color Match:
      // Si hay un color seleccionado, la variante DEBE tener ese color.
      // Si NO hay color seleccionado, la variante NO DEBE tener el atributo 'Color'.
      const colorAttr = v.attributes.find(a => a.key === 'Color');
      const colorMatch = this.selectedColor
        ? (colorAttr && colorAttr.value === this.selectedColor)
        : !colorAttr; // <--- El FIX CLAVE

      // Lógica de Talla Match:
      // Si hay talla seleccionada, la variante DEBE tener esa talla.
      // Si NO hay talla seleccionada, la variante NO DEBE tener el atributo 'Talla'.
      const tallaAttr = v.attributes.find(a => a.key === 'Talla');
      const tallaMatch = this.selectedTalla
        ? (tallaAttr && tallaAttr.value === this.selectedTalla)
        : !tallaAttr; // <--- El FIX CLAVE

      // Para tu caso, la Talla siempre existe, así que la lógica de deselección de talla
      // (this.selectedTalla = undefined) hará que tallaMatch sea !tallaAttr.
      // Como todas tus variantes TIENEN tallaAttr, tallaMatch será 'false',
      // y selectedVariant será 'undefined'. ¡Esto es correcto!

      // PERO, si tuvieras variantes sin Talla, la lógica sería:
      // Si el usuario deselecciona Talla, quiere una variante sin Talla.
      // Vamos a asumir que Talla siempre debe estar seleccionada si existe.

      // Lógica de Talla REVISADA (más simple y se ajusta a tu modelo):
      // Si hay tallas disponibles para elegir (con o sin color),
      // el usuario DEBE seleccionar una.
      const tallaAttrCheck = v.attributes.find(a => a.key === 'Talla');
      const tallaMatchRevised = this.selectedTalla
        ? (tallaAttrCheck && tallaAttrCheck.value === this.selectedTalla)
        : false; // <--- Si no hay talla seleccionada, no hay match.

      // Si no hay NINGUNA talla para esta selección (ej. un producto solo por color)
      if (this.availableTallas.length === 0) {
        return colorMatch; // Solo importa el color
      }

      // Si no hay NINGUN color (ej. un producto solo por talla)
      if (this.uniqueColors.length === 0) {
        return tallaMatchRevised; // Solo importa la talla
      }

      // Si hay ambos, ambos deben coincidir
      return colorMatch && tallaMatchRevised;
    });

    this.updateUIForSelectedVariant();
  }

  /**
   * Actualiza la imagen principal cuando cambia la variante seleccionada.
   */
  private updateUIForSelectedVariant(): void {
    if (this.selectedVariant && this.selectedVariant.images?.length) {
      this.selectedImage = this.selectedVariant.images[0];
    } else {
      this.resetToDefaultImage();
    }
  }

  /**
   * Establece la imagen principal a la primera imagen de la primera variante.
   */
  private resetToDefaultImage(): void {
    if (
      this.product &&
      this.product.variants.length > 0 &&
      this.product.variants[0].images &&
      this.product.variants[0].images.length > 0
    ) {
      this.selectedImage = this.product.variants[0].images[0];
    }
  }

  /**
   * Helper para la UI: cambia la imagen principal al hacer clic en una miniatura.
   */
  selectImage(image: string): void {
    this.selectedImage = image;
  }

  /**
   * Helper para la UI: revisa el stock de una talla específica (para deshabilitar el botón).
   * CAMBIADO: de isOutOfStock(size) a isOutOfStock(talla)
   */
  isOutOfStock(talla: string): boolean {
    const variant = this.product?.variants.find((v) => {
      // Coincide con el color seleccionado (o con la falta de color)
      const colorAttr = v.attributes.find(a => a.key === 'Color');
      const colorMatch = this.selectedColor
        ? (colorAttr && colorAttr.value === this.selectedColor)
        : !colorAttr;

      // Coincide con la TALLA específica que estamos comprobando
      const tallaMatch =
        v.attributes.find((a) => a.key === 'Talla' && a.value === talla) !==
        undefined;

      return colorMatch && tallaMatch;
    });

    return variant ? variant.stock === 0 : true;
  }

  /**
   * Lógica para añadir al carrito.
   */
  addToCart(): void {
    if (!this.selectedVariant || this.selectedVariant.stock === 0) {
      return;
    }
    console.log('Añadiendo al carrito:', {
      sku: this.selectedVariant.sku,
      productId: this.product?._id,
      quantity: 1,
    });
  }
}
