import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

interface SoftwarePreviewDialogProps {
  open: boolean
  onClose: () => void
  title: string
  image: string
}

export const SoftwarePreviewDialog = ({
  open,
  onClose,
  title,
  image,
}: SoftwarePreviewDialogProps) => {

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Preview of the software interface / marketing image.
          </Typography>
          <img
            src={image}
            alt={title}
            style={{
              width: '100%',
              borderRadius: 0,
              objectFit: 'cover',
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/products/placeholder.jpg'
            }}
          />
        </Stack>
      </DialogContent>
    </Dialog>
  )
}


