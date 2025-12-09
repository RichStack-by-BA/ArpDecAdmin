import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';

export function NeedHelpView() {
  const router = useRouter();

  const helpOptions = [
    {
      icon: 'solar:letter-opened-bold',
      title: 'Email Support',
      description: 'arpandecores@gmail.com',
      action: 'Send Email',
      color: '#22C55E',
      link: 'mailto:arpandecores@gmail.com',
    },
    {
      icon: 'mingcute:whatsapp-fill',
      title: 'WhatsApp Support',
      description: 'Chat with us on WhatsApp: +91 7587144408',
      action: 'Open WhatsApp',
      color: '#25D366',
      link: 'https://wa.me/917587144408',
    },
    {
      icon: 'solar:phone-bold',
      title: 'Phone Support',
      description: 'Call us at +91 7587144408',
      action: 'Call Now',
      color: '#FF5630',
      link: 'tel:+917587144408',
    },
  ];

  return (
    <>
      <Box
        sx={{
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 5,
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            display: 'flex',
            borderRadius: '50%',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'primary.lighter',
            mb: 2,
          }}
        >
          <Iconify icon="solar:chat-round-dots-bold" width={48} sx={{ color: 'primary.main' }} />
        </Box>

        <Typography variant="h4">Need Help?</Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            textAlign: 'center',
          }}
        >
          We&apos;re here to assist you. Choose the best way to reach us.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          mb: 3,
        }}
      >
        {helpOptions.map((option) => (
          <Card
            key={option.title}
            sx={{
              cursor: 'pointer',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              },
            }}
            onClick={() => window.open(option.link, '_blank')}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    display: 'flex',
                    borderRadius: 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: `${option.color}20`,
                  }}
                >
                  <Iconify icon={option.icon as any} width={24} sx={{ color: option.color }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>
                    {option.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                    {option.description}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: option.color,
                      color: option.color,
                      '&:hover': {
                        borderColor: option.color,
                        bgcolor: `${option.color}10`,
                      },
                    }}
                  >
                    {option.action}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <Link
          variant="subtitle2"
          sx={{ cursor: 'pointer' }}
          onClick={() => router.push('/sign-in')}
        >
          Back to Sign In
        </Link>
      </Box>
    </>
  );
}
