// V1.1 UPDATE: Integration code for local image storage
// This file contains the code changes needed to integrate imageStorageService
// DO NOT apply these changes until v1.1 - they are for reference only

import { saveReceiptImage, loadReceiptImage, deleteReceiptImage } from './services/imageStorageService';

// ============================================
// 1. ADD STATE FOR IMAGE DATA
// ============================================
// Add to App.tsx state declarations (around line 49)

const [receiptImageData, setReceiptImageData] = useState<string | null>(null);

// ============================================
// 2. UPDATE handleCapture TO STORE IMAGE
// ============================================
// Replace existing handleCapture function

const handleCapture = async () => {
    try {
        const image = await Camera.getPhoto({
            quality: 70,  // Compress to 70% quality to save space
            allowEditing: false,
            resultType: CameraResultType.Base64,
            source: CameraSource.Camera
        });

        if (image.base64String) {
            setIsProcessing(true);

            // Store image data for later saving
            setReceiptImageData(image.base64String);

            // Parse receipt with Gemini
            const parsed = await parseReceiptImage(image.base64String);
            setReceipt(parsed);

            setIsProcessing(false);
        }
    } catch (error) {
        console.error('Camera error:', error);
        setIsProcessing(false);
    }
};

// ============================================
// 3. UPDATE handleFileUpload TO STORE IMAGE
// ============================================
// Replace existing handleFileUpload function

const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const base64Data = base64.split(',')[1];

        // Store image data for later saving
        setReceiptImageData(base64Data);

        // Parse receipt
        const parsed = await parseReceiptImage(base64Data);
        setReceipt(parsed);
        setIsProcessing(false);
    };

    reader.readAsDataURL(file);
};

// ============================================
// 4. UPDATE handleSaveReceipt TO SAVE IMAGE
// ============================================
// Replace existing handleSaveReceipt function

const handleSaveReceipt = async () => {
    if (!receipt || assignments.length === 0) return;

    setIsSaving(true);
    try {
        const userId = null; // Or get from auth

        // Generate unique receipt ID
        const receiptId = `receipt_${Date.now()}`;

        // Save image locally if we have one
        let imageFilename: string | undefined;
        if (receiptImageData) {
            imageFilename = await saveReceiptImage(receiptImageData, receiptId);
        }

        // Save to Supabase with image filename reference
        await saveReceiptSession(userId, receipt, assignments, imageFilename);

        // Reload history
        await loadHistory();

        // Reset state
        setReceipt(null);
        setAssignments([]);
        setReceiptImageData(null);  // Clear image data
        setActiveTab('receipt');

        alert('Receipt saved successfully!');
    } catch (error) {
        console.error('Save failed:', error);
        alert('Failed to save receipt');
    }
    setIsSaving(false);
};

// ============================================
// 5. UPDATE handleSelectHistory TO LOAD IMAGE
// ============================================
// Add image loading to handleSelectHistory

const handleSelectHistory = async (item: any) => {
    setReceipt({
        items: item.items,
        tax: item.tax,
        tip: item.tip,
        total: item.total,
        currency: item.currency
    });
    setAssignments(item.assignments);

    // Load image if available
    if (item.image_filename) {
        const imageData = await loadReceiptImage(item.image_filename);
        if (imageData) {
            setReceiptImageData(imageData);
        }
    }

    setActiveTab('summary');
};

// ============================================
// 6. ADD DELETE IMAGE WHEN DELETING RECEIPT
// ============================================
// If you add a delete receipt feature, include this:

const handleDeleteReceipt = async (receiptId: string, imageFilename?: string) => {
    try {
        // Delete from Supabase
        await supabase.from('receipts').delete().eq('id', receiptId);

        // Delete local image if exists
        if (imageFilename) {
            await deleteReceiptImage(imageFilename);
        }

        // Reload history
        await loadHistory();
    } catch (error) {
        console.error('Delete failed:', error);
    }
};

// ============================================
// 7. OPTIONAL: SHOW IMAGE PREVIEW IN HISTORY
// ============================================
// Add to HistoryView component to show thumbnails

const HistoryViewWithImages: React.FC<{ history: any[], onSelect: (item: any) => void }> = ({ history, onSelect }) => {
    const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({});

    useEffect(() => {
        // Load thumbnails for receipts with images
        history.forEach(async (item) => {
            if (item.image_filename && !imagePreviews[item.id]) {
                const imageData = await loadReceiptImage(item.image_filename);
                if (imageData) {
                    setImagePreviews(prev => ({ ...prev, [item.id]: `data:image/jpeg;base64,${imageData}` }));
                }
            }
        });
    }, [history]);

    return (
        <div className= "space-y-4" >
        {
            history.map((item) => (
                <div key= { item.id } onClick = {() => onSelect(item)} className = "flex gap-3" >
                    {/* Thumbnail preview */ }
{
    imagePreviews[item.id] && (
        <img 
              src={ imagePreviews[item.id] }
    alt = "Receipt"
    className = "w-16 h-16 object-cover rounded-lg"
        />
          )
}
{/* Receipt info */ }
<div className="flex-1" >
    <p className="font-bold" > { new Date(item.created_at).toLocaleDateString() } </p>
        < p className = "text-sm text-zinc-500" > { item.note } </p>
            </div>
            </div>
      ))}
</div>
  );
};
