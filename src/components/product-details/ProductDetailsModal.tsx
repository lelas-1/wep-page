import Dialog from "../ui/Dialog";
import DialogHeader from "../ui/DialogHeader";
import DialogBody from "../ui/DialogBody";
import ProductDetailsContent from "./ProductDetailsContent";
import { useProductModal } from "../../context/ProductModalContext";
import { useLanguage } from "../../context/LanguageContext";

export default function ProductDetailsModal() {
  const { product, close } = useProductModal();
  const { t } = useLanguage();

  return (
    <Dialog open={product !== null} onClose={close} titleId="product-details-title" maxWidthClassName="sm:max-w-[1000px]">
      <DialogHeader
        titleId="product-details-title"
        title={product ? t(product.nameAr || product.name, product.name) : ""}
        onClose={close}
        closeLabel={t("إغلاق", "Close")}
      />
      <DialogBody>{product && <ProductDetailsContent product={product} />}</DialogBody>
    </Dialog>
  );
}
