import {
  Component, OnInit, ElementRef, Renderer2, OnDestroy, OnChanges, SimpleChanges, forwardRef,
} from '@angular/core'
import { ElSelectPoprs } from './select-props'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'

@Component({
  selector: 'el-select',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ElSelect),
    multi: true
  }],
  styles: ['.el-select-dropdown__list { overflow: hidden; }'],
  template: `
    <div class="el-select" (click)="toggleHandle($event)">
      <el-input [model]="selectedLabel" [placeholder]="placeholder" [icon]="iconClass"
        iconClass="el-select__caret"
        [name]="name" [size]="size" [elDisabled]="elDisabled"
        (mouseenter)="mouseHandle(true)" (mouseleave)="mouseHandle(false)"
        (icon-click)="clearSelected($event)">
      </el-input>
      <ng-container>
        <el-select-dropdown [isActived]="dropdownActive">
          <ul class="el-scrollbar__view el-select-dropdown__list">
            <ng-content></ng-content>
          </ul>
        </el-select-dropdown>
      </ng-container>
    </div>
  `,
})
export class ElSelect extends ElSelectPoprs implements OnInit, OnDestroy, OnChanges, ControlValueAccessor {
  
  
  selfWidth: string
  subscriber: Function[] = []
  
  dropdownActive: boolean = false
  selectedLabel: string | number
  iconClass: string = 'arrow-up'
  globalListener: Function
  
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {
    super()
  }
  
  mouseHandle(isEnter: boolean = false): void {
    if (!this.clearable || !this.model) return
    this.iconClass = `${isEnter ? 'circle-close is-reverse' : 'arrow-up'}`
  }
  
  toggleHandle(event?: Event): void {
    if (this.elDisabled) return
    event && event.stopPropagation()
    this.dropdownActive = !this.dropdownActive
    const nextClass = 'arrow-up' + (this.dropdownActive ? ' is-reverse' : '')
    this.iconClass = !this.clearable ? nextClass : this.iconClass
  }
  
  clearSelected(event: Event): void {
    if (!this.clearable) return
    event.stopPropagation()
    // reset icon
    this.mouseHandle(false)
    // reset selected label
    this.changeLabel(null, null)
    // reset model
    this.model = null
    this.modelChange.emit(this.model)
    this.controlChange(this.model)
    this.subscriber.forEach(sub => sub())
    // close dropdown menu
    this.dropdownActive = false
  }
  
  changeLabel(nextLabel: string | number, nextValue?: any): void {
    this.dropdownActive && this.toggleHandle()
    // only update label
    this.selectedLabel = nextLabel
    if (!nextValue || this.model === nextValue) return
    
    this.model = nextValue
    this.modelChange.emit(nextValue)
    this.controlChange(nextValue)
    this.subscriber.forEach(sub => sub())
  }
  
  ngOnInit(): void {
    const timer: any = setTimeout(() => {
      this.selfWidth = this.el.nativeElement.getBoundingClientRect().width
      clearTimeout(timer)
    }, 0)
    this.globalListener = this.renderer.listen('document', 'click', () => {
      this.dropdownActive && this.toggleHandle()
    })
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    // not include model
    if (!changes || !changes.model) return
    if (changes.model.isFirstChange()) return
    
    // reset model
    if (!changes.model.currentValue) {
      this.selectedLabel = changes.model.currentValue
      this.model = changes.model.currentValue
      this.modelChange.emit(changes.model.currentValue)
      this.controlChange(this.model)
    }
    this.subscriber.forEach(sub => sub())
  }
  
  ngOnDestroy(): void {
    this.globalListener && this.globalListener()
  }
  
  writeValue(value: any): void {
    this.model = value
  }
  
  registerOnChange(fn: Function): void {
    this.controlChange = fn
  }
  
  registerOnTouched(fn: Function): void {
    this.controlTouch = fn
  }
  
  private controlChange: Function = () => {}
  private controlTouch: Function = () => {}
  
}
