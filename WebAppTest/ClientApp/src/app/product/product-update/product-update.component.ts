import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { dateSubstring_1_10, noWhitespaceValidator } from './../../shared/helperFunctions';
import { Subscription } from 'rxjs';
import { ProductService } from './../shared/product.service';
import { CategoryService } from './../../category/shared/category.service';
import { ProductComponent } from '../product.component';

@Component({
  selector: 'app-product-update',
  templateUrl: './product-update.component.html',
  styleUrls: ['./../../shared/styles.css', '../product.component.css']
})
export class ProductUpdateComponent implements OnInit {

  public categories: any[];
  public product: any;
  productId: number;
  clickEventsubscription: Subscription;
  productUpdateForm: FormGroup;
  submitted = false;

  constructor(private productComponent: ProductComponent, private modalService: NgbModal, private formBuilder: FormBuilder,
              private productService: ProductService, private categoryService: CategoryService, private router: Router) { }

  ngOnInit() {
    this.productService.getProductId().subscribe(id => this.productId = id);
    this.getCategoryList();
    this.createForm(); // Always creates the default Form
    this.getProductById(this.productId);
  }

  async getCategoryList() {
    this.categoryService.getAllCategories().then((data: any[]) => {
      this.categories = data;
    })
    .catch((error) => {
      if (error.status === 401) {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      }
    });
  }

  // Default Form
  createForm() {
    this.productUpdateForm = this.formBuilder.group({
      Id: [0],
      // validates date format yyyy-mm-dd
      datePurchased: ['', [Validators.required, Validators.pattern(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/)]],
      categoryId: [null, [Validators.required]],
      description: ['', [Validators.required, Validators.maxLength(200)]],
      price: [null, [Validators.required, Validators.min(0), Validators.pattern(/^-?\d*(?:[.,]\d{1,2})?$/)]],
      paid: [false, Validators.required]
    }, {
      validator: noWhitespaceValidator('description')
    });
  }

  // Updateable Form
  updateForm() {
    this.productUpdateForm = this.formBuilder.group({
      Id: [this.product.id],
      // validates date format yyyy-mm-dd
      datePurchased: [dateSubstring_1_10(this.product.datePurchased), [Validators.required,
                                     Validators.pattern(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/)]],
      categoryId: [this.product.category.id, [Validators.required]],
      description: [this.product.description, [Validators.required, Validators.maxLength(200)]],
      price: [this.product.price, [Validators.required, Validators.min(0), Validators.pattern(/^-?\d*(?:[.,]\d{1,2})?$/)]],
      paid: [this.product.paid, Validators.required]
    }, {
      validator: noWhitespaceValidator('description')
    });
  }

  async getProductById(id: number) {
    this.productService.getProductById(id.toString()).then((data: any[]) => {
      this.product = data;
      this.updateForm();
    })
    .catch((error) => {
      if (error.status === 401) {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      }
    });
  }

  // Convenience getter for easy access to form fields
  get f() { return this.productUpdateForm.controls; }

  // Submit the form
  onSubmit() {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.productUpdateForm.invalid) {
        return;
    }

    // convert categoryId (string) to number
    this.productUpdateForm.value.categoryId = Number(this.productUpdateForm.value.categoryId);
    this.productService.updateProduct(this.productUpdateForm.value, this.productId.toString()).then((data: any[]) => {
      this.productComponent.getProductList(this.productComponent.yearFilter,
        this.productComponent.monthFilter,
        this.productComponent.dayFilter,
        this.productComponent.descFilter,
        this.productComponent.catgFilter);
    })
    .catch((error) => {
      if (error.status === 401) {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      }
      if (error.status === 404) {
        console.log('No connection with Database (404)');
      }
    });

    this.onReset();
  }

  // Reset the form
  onReset() {
    this.submitted = false;
    this.modalService.dismissAll(); // Close all modals
    this.productUpdateForm.reset(); // Reset form
  }
}
