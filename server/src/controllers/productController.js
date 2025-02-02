const Product = require('../models/Product');
const { generateCleanDescription, analyzeThreatLevel, generateProductChatResponse } = require('../services/openai');

exports.createProduct = async (req, res) => {
  try {
    const { name, description, technologies, tags } = req.body;
    const cleanDescription = await generateCleanDescription(description);
    
    const product = new Product({
      userId: req.user._id,
      name,
      description,
      cleanDescription,
      technologies,
      tags
    });

    await product.save();
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (updates.description) {
      updates.cleanDescription = await generateCleanDescription(updates.description);
    }

    const product = await Product.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updates,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ userId: req.user._id });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ _id: id, userId: req.user._id });
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateThreatStatus = async (req, res) => {
  try {
    const { id, threatId } = req.params;
    const { status } = req.body;

    const product = await Product.findOneAndUpdate(
      { 
        _id: id, 
        userId: req.user._id,
        'threats._id': threatId 
      },
      { 
        $set: { 
          'threats.$.status': status,
          'threats.$.reviewed': true
        }
      },
      { new: true }
    );

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProductChat = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const product = await Product.findOne({ _id: id, userId: req.user._id })
      .populate('threats.newsId');

    // Get only the relevant threats for this product
    const relevantThreats = product.threats.map(t => t.newsId);

    // Generate chat response specific to this product and its threats
    const response = await generateProductChatResponse(message, product, relevantThreats);

    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ _id: id, userId: req.user._id })
      .populate('threats.newsId')
      .lean();

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const threatSummary = {
      safe: 0,
      warning: 0,
      danger: 0,
      unreviewedCount: 0,
      latestThreats: [],
      overallStatus: 'safe'
    };

    // Process threats
    product.threats.forEach(threat => {
      threatSummary[threat.status]++;
      if (!threat.reviewed) {
        threatSummary.unreviewedCount++;
      }

      // Add to latest threats if not reviewed or high severity
      if (!threat.reviewed || threat.severity > 70) {
        threatSummary.latestThreats.push({
          status: threat.status,
          severity: threat.severity,
          reviewed: threat.reviewed,
          createdAt: threat.createdAt,
          news: threat.newsId
        });
      }
    });

    // Sort latest threats by severity and date
    threatSummary.latestThreats.sort((a, b) => {
      if (b.severity !== a.severity) return b.severity - a.severity;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Limit to 5 most critical threats
    threatSummary.latestThreats = threatSummary.latestThreats.slice(0, 5);

    // Determine overall status
    if (threatSummary.danger > 0) {
      threatSummary.overallStatus = 'danger';
    } else if (threatSummary.warning > 0) {
      threatSummary.overallStatus = 'warning';
    }

    res.json({
      success: true,
      product: {
        name: product.name,
        technologies: product.technologies,
        tags: product.tags
      },
      threatSummary
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllProductsStatus = async (req, res) => {
  try {
    const products = await Product.find({ userId: req.user._id })
      .populate('threats.newsId')
      .lean();

    const statusSummary = products.map(product => {
      const summary = {
        id: product._id,
        name: product.name,
        safe: 0,
        warning: 0,
        danger: 0,
        unreviewedCount: 0,
        overallStatus: 'safe'
      };

      product.threats.forEach(threat => {
        summary[threat.status]++;
        if (!threat.reviewed) summary.unreviewedCount++;
      });

      // Determine overall status
      if (summary.danger > 0) {
        summary.overallStatus = 'danger';
      } else if (summary.warning > 0) {
        summary.overallStatus = 'warning';
      }

      return summary;
    });

    res.json({
      success: true,
      products: statusSummary
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}; 