import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Divider,
  IconButton,
  Box,
  Avatar,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import CodeIcon from '@mui/icons-material/Code'
import EmailIcon from '@mui/icons-material/Email'
import GitHubIcon from '@mui/icons-material/GitHub'
import PersonIcon from '@mui/icons-material/Person'

interface AboutModalProps {
  open: boolean
  onClose: () => void
}

export const AboutModal = ({ open, onClose }: AboutModalProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} alignItems="center">
            <CodeIcon color="primary" />
            <Typography variant="h6">About the Developer</Typography>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          {/* Developer Image Placeholder */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar
              src="/assets/developer.jpg"
              alt="Developer"
              sx={{
                width: 120,
                height: 120,
                bgcolor: 'primary.main',
                fontSize: '3rem',
              }}
            >
              <PersonIcon sx={{ fontSize: '4rem' }} />
            </Avatar>
          </Box>
          <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
            Add developer image at: /public/assets/developer.jpg
          </Typography>

          <Divider />

          <Box>
            <Typography variant="h6" gutterBottom>
              AXIS STORE
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A modern ecommerce platform built with cutting-edge technologies
              to deliver the best shopping experience.
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Built with
            </Typography>
            <Stack spacing={1} mt={1}>
              <Typography variant="body2">• React + TypeScript</Typography>
              <Typography variant="body2">• Vite</Typography>
              <Typography variant="body2">• Material UI</Typography>
              <Typography variant="body2">• Firebase Authentication</Typography>
              <Typography variant="body2">• Firestore Database</Typography>
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Developer Information
            </Typography>
            <Stack spacing={1} mt={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <EmailIcon fontSize="small" color="primary" />
                <Typography variant="body2">
                  For inquiries, please contact the development team.
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              © {new Date().getFullYear()} AXIS STORE. All rights reserved.
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

