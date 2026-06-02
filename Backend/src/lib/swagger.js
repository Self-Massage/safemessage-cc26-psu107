import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smishing Detection API Documentation',
      version: '1.0.0',
      description: 'Dokumentasi API interaktif untuk aplikasi Smishing Detection (Deteksi SMS Phishing). Terhubung secara otomatis ke database cloud Neon dan model deteksi AI.',
      contact: {
        name: 'Developer Support',
        email: 'developer@example.com'
      }
    },
    servers: [
      {
        url: 'https://dicoding-backend-nine.vercel.app',
        description: 'Server Produksi (Vercel Cloud)'
      },
      {
        url: 'http://localhost:5000',
        description: 'Server Lokal (Development)'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Masukkan token JWT Anda untuk mengakses endpoint yang dilindungi.'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        History: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            message: { type: 'string' },
            status: { type: 'string', example: 'phishing' },
            reason: { type: 'string' },
            confidence: { type: 'number', example: 99.97 },
            rekomendasi: { type: 'string', example: 'Status pesan...' },
            phishingScore: { type: 'number', example: 99.97 },
            normalScore: { type: 'number', example: 0.03 },
            label: { type: 'string', example: 'PHISHING' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        Feedback: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            category: { type: 'string', example: 'UI/UX' },
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    paths: {
      '/health': {
        get: {
          summary: 'Cek Kesehatan Server',
          description: 'Mengecek status server backend apakah berjalan normal atau tidak.',
          tags: ['System'],
          responses: {
            200: {
              description: 'Server berjalan dengan normal.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'ok' },
                      timestamp: { type: 'string', format: 'date-time' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/auth/register': {
        post: {
          summary: 'Daftar Akun Baru (Register)',
          description: 'Mendaftarkan pengguna baru dengan nama, email, dan password.',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', example: 'Hafizh' },
                    email: { type: 'string', example: 'hafizh@example.com' },
                    password: { type: 'string', example: 'password123' }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Registrasi berhasil.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      message: { type: 'string', example: 'User registered successfully.' },
                      token: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
                      data: { $ref: '#/components/schemas/User' }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Permintaan tidak valid (misal: email sudah digunakan).'
            }
          }
        }
      },
      '/api/v1/auth/login': {
        post: {
          summary: 'Masuk Akun (Login)',
          description: 'Masuk ke sistem menggunakan email dan password untuk mendapatkan token JWT.',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'hafizh@example.com' },
                    password: { type: 'string', example: 'password123' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Login berhasil.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      token: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
                      data: { $ref: '#/components/schemas/User' }
                    }
                  }
                }
              }
            },
            401: {
              description: 'Kredensial salah (password/email salah).'
            }
          }
        }
      },
      '/api/v1/auth/google': {
        post: {
          summary: 'Masuk dengan Google (Google Sign-In)',
          description: 'Mengirim token ID Google (credential) dari frontend untuk diverifikasi oleh backend, lalu mendaftarkan user baru atau mengembalikan token JWT aplikasi.',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['token'],
                  properties: {
                    token: { type: 'string', description: 'Google ID Token (credential) yang diterima oleh frontend setelah login berhasil.' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Otentikasi Google berhasil.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      message: { type: 'string', example: 'Login dengan Google berhasil!' },
                      token: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
                      data: { $ref: '#/components/schemas/User' }
                    }
                  }
                }
              }
            },
            401: {
              description: 'Token Google tidak valid atau kedaluwarsa.'
            }
          }
        }
      },
      '/api/v1/auth/me': {
        get: {
          summary: 'Dapatkan Profil Pengguna (Me)',
          description: 'Mengambil informasi profil user yang sedang login dengan menyertakan token JWT.',
          tags: ['Authentication'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Berhasil mengambil profil.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data: { $ref: '#/components/schemas/User' }
                    }
                  }
                }
              }
            },
            401: {
              description: 'Token tidak valid atau tidak disertakan.'
            }
          }
        }
      },
      '/api/v1/predictions/check': {
        post: {
          summary: 'Deteksi SMS Phishing (Check SMS)',
          description: 'Mengirim teks pesan SMS ke model AI untuk mendeteksi apakah pesan tersebut aman atau phishing. Hasil deteksi otomatis disimpan ke riwayat pengguna.',
          tags: ['Detection Gateway'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['message'],
                  properties: {
                    message: { type: 'string', example: 'Selamat! Anda terpilih mendapatkan hadiah Rp 50.000.000 dari Shopee. Klik link berikut bit.ly/shopee-hadiah' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Pesan berhasil dianalisis.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          message: { type: 'string' },
                          status: { type: 'string', example: 'phishing' },
                          reason: { type: 'string', example: 'Status pesan...' },
                          confidence: { type: 'number', example: 99.97 },
                          rekomendasi: { type: 'string', example: 'Status pesan...' },
                          phishingScore: { type: 'number', example: 99.97 },
                          normalScore: { type: 'number', example: 0.03 },
                          label: { type: 'string', example: 'PHISHING' },
                          timestamp: { type: 'string', format: 'date-time' }
                        }
                      }
                    }
                  }
                }
              }
            },
            401: {
              description: 'Akses tidak diizinkan (Token JWT tidak valid).'
            }
          }
        }
      },
      '/api/v1/history': {
        get: {
          summary: 'Dapatkan Semua Riwayat Deteksi',
          description: 'Mengambil daftar riwayat deteksi SMS yang pernah dilakukan oleh pengguna yang sedang aktif.',
          tags: ['History'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Berhasil mengambil riwayat.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/History' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        delete: {
          summary: 'Hapus Semua Riwayat Deteksi',
          description: 'Menghapus seluruh daftar riwayat deteksi milik pengguna aktif secara permanen dari database.',
          tags: ['History'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Riwayat berhasil dihapus.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      message: { type: 'string', example: 'Detection history cleared successfully.' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/history/stats': {
        get: {
          summary: 'Ambil Statistik Deteksi',
          description: 'Mengambil total akumulasi deteksi, total pesan aman, dan total pesan phishing yang telah dianalisis oleh pengguna aktif.',
          tags: ['History'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Statistik berhasil dihitung.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data: {
                        type: 'object',
                        properties: {
                          totalCount: { type: 'integer', example: 12 },
                          safeCount: { type: 'integer', example: 8 },
                          phishingCount: { type: 'integer', example: 4 }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/feedbacks': {
        post: {
          summary: 'Kirim Masukan Pengguna (Submit Feedback)',
          description: 'Mengirimkan kritik, saran, atau rating dari pengguna terkait aplikasi. Menyertakan JWT token bersifat opsional (jika disertakan, feedback otomatis dikaitkan ke profil user).',
          tags: ['Feedback'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['category', 'message'],
                  properties: {
                    category: { type: 'string', example: 'Bug Report' },
                    message: { type: 'string', example: 'Tombol registrasi di frontend tidak merespon saat diklik pertama kali.' },
                    email: { type: 'string', example: 'hafizh.guest@example.com' }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Feedback berhasil disimpan.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      message: { type: 'string', example: 'Feedback submitted successfully.' },
                      data: { $ref: '#/components/schemas/Feedback' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: []
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };
