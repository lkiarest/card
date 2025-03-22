import TemplateLoader from './template-loader.js';

new Vue({
  el: '#app',
  data: {
    cardData: {
      name: '',
      title: '',
      phone: '',
      email: '',
      address: '',
      company: '',
      website: '',
      logo: '',
      qrcode: ''
    },
    qrCode: null,
    selectedTemplate: null,
    templates: []
  },
  async created() {
    try {
      // 从 localStorage 中获取保存的名片数据
      const savedCardData = localStorage.getItem('cardData');
      if (savedCardData) {
        try {
          // 解析并合并保存的数据
          const parsedData = JSON.parse(savedCardData);
          this.cardData = { ...this.cardData, ...parsedData };
        } catch (error) {
          console.error('解析保存的名片数据失败:', error);
        }
      }
      // 初始化模板
      const templateLoader = new TemplateLoader();
      this.templates = await templateLoader.loadTemplates();
      this.selectedTemplate = this.templates[0]?.id || '';
    } catch (error) {
      console.error('初始化模板失败:', error);
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.generateQRCode();
    });
  },
  computed: {
    currentTemplate() {
      const template = this.templates.find(t => t.id === this.selectedTemplate) || {};
      return template;
    }
  },
  methods: {
    handleLogoUpload(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.cardData.logo = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    exportCard(e) {
      const type = e.srcElement.dataset['type']
      const selectedName = this.templates.find(t => t.id === this.selectedTemplate)?.name || 'card';
      const container = e.srcElement.closest('.card-template');
      html2canvas(container, {
        logging: true,
        useCORS: true,
        scale: window.devicePixelRatio * 2
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `${selectedName}-${type}.png`;
        link.href = canvas.toDataURL();
        link.click();
      });
    },
    generateQRCode() {
      if (!this.cardData.website) return;
      if (this.qrCode) {
        this.qrCode.clear();
        this.qrCode.makeCode(this.cardData.website);
      } else {
        this.qrCode = new window.QRCode(this.getQrElement(), {
          text: this.cardData.website,
          width: 80,
          height: 80
        });
      }
      // 获取二维码图片的 base64 数据
      const qrCanvas = this.getQrElement().querySelector('canvas');
      if (qrCanvas) {
        this.cardData.qrcode = qrCanvas.toDataURL('image/png');
      }
    },
    getQrElement() {
      return document.getElementById('qrcode-container');
    },
  },
  watch: {
    'cardData.website': function(newVal) {
      if (newVal) {
        this.generateQRCode();
      } else {
        this.getQrElement().innerHTML = '';
        this.qrCode = null;
        this.cardData.qrcode = '';
      }
    },
    'cardData': {
      deep: true,
      handler(newVal) {
        // 将名片数据保存到 localStorage
        localStorage.setItem('cardData', JSON.stringify(newVal));
      }
    }
  }
});
