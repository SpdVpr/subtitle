# Google Search Console Setup Guide

## 🎯 Quick Actions After Deployment

### 1. **Submit Updated Sitemap**

After deploying the redirect fixes, submit the sitemap to Google:

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property: `subtitlebot.com`
3. Go to **Sitemaps** (left sidebar)
4. Enter sitemap URL: `https://www.subtitlebot.com/sitemap.xml`
5. Click **Submit**

### 2. **Request Re-indexing of Redirected URLs**

For each 404 URL that now has a redirect:

1. Go to **URL Inspection** tool
2. Enter the old URL (e.g., `/video-player`)
3. Click **Request Indexing**
4. Repeat for all redirected URLs:
   - `/video-player` → `/video-tools`
   - `/subtitle-overlay` → `/video-tools`
   - `/help` → `/contact`
   - `/privacy-policy` → `/privacy`
   - `/cookie-policy` → `/cookies`
   - `/faq` → `/contact`
   - `/support` → `/contact`

### 3. **Monitor 404 Errors**

1. Go to **Coverage** or **Pages** report
2. Check for new 404 errors
3. Fix any new issues with redirects or by creating pages

### 4. **Check Mobile Usability**

1. Go to **Mobile Usability** report
2. Fix any mobile-specific issues
3. Test on real devices

### 5. **Monitor Core Web Vitals**

1. Go to **Core Web Vitals** report
2. Check for:
   - LCP (Largest Contentful Paint) < 2.5s
   - FID (First Input Delay) < 100ms
   - CLS (Cumulative Layout Shift) < 0.1

## 📊 What to Monitor Weekly

### Performance Metrics:
- **Impressions**: How many times your site appears in search
- **Clicks**: How many people click through
- **CTR**: Click-through rate (clicks/impressions)
- **Average Position**: Where you rank on average

### Technical Issues:
- **Coverage Errors**: Pages that can't be indexed
- **Mobile Usability**: Mobile-specific problems
- **Core Web Vitals**: Performance issues
- **Security Issues**: Hacking or malware warnings

### Search Queries:
- **Top Queries**: What people search to find you
- **Top Pages**: Which pages get the most traffic
- **Countries**: Where your traffic comes from
- **Devices**: Desktop vs mobile vs tablet

## 🔍 Expected Results After Fixes

### Immediate (1-3 days):
- ✅ 404 errors should decrease
- ✅ Redirects should be recognized
- ✅ Sitemap should show as "Success"

### Short-term (1-2 weeks):
- ✅ Old URLs should redirect properly
- ✅ New URLs should start appearing in search
- ✅ Impressions may temporarily drop (normal during redirects)

### Long-term (1-3 months):
- ✅ Rankings should stabilize or improve
- ✅ All 404 errors should be resolved
- ✅ Traffic should return to normal or increase

## 🚨 Common Issues & Solutions

### Issue: "Submitted URL not found (404)"
**Solution**: 
- Check if the page exists
- Verify the URL in sitemap.xml
- Add redirect if URL changed

### Issue: "Redirect error"
**Solution**:
- Check redirect chain (should be 1 redirect, not multiple)
- Verify redirect is 301 (permanent), not 302 (temporary)
- Test redirect manually

### Issue: "Duplicate content"
**Solution**:
- Use canonical tags (already implemented)
- Consolidate similar pages
- Use 301 redirects for duplicates

### Issue: "Mobile usability errors"
**Solution**:
- Test on real mobile devices
- Fix viewport issues
- Ensure buttons are large enough
- Check font sizes

### Issue: "Slow page speed"
**Solution**:
- Optimize images
- Minimize JavaScript
- Enable caching
- Use CDN

## 📝 Checklist

### Initial Setup:
- [x] Verify site ownership in Google Search Console
- [x] Submit sitemap.xml
- [x] Set preferred domain (www vs non-www)
- [x] Link Google Analytics (if using)

### After Redirect Implementation:
- [ ] Submit updated sitemap
- [ ] Request re-indexing of redirected URLs
- [ ] Monitor 404 errors for 1 week
- [ ] Check redirect chains
- [ ] Verify all redirects are 301 (permanent)

### Ongoing Maintenance:
- [ ] Check Search Console weekly
- [ ] Monitor new 404 errors
- [ ] Track ranking changes
- [ ] Analyze search queries
- [ ] Fix any new issues promptly

## 🎉 Success Metrics

### Week 1:
- ✅ 404 errors reduced from 9 to 0
- ✅ All redirects working properly
- ✅ Sitemap submitted successfully

### Month 1:
- ✅ All old URLs redirecting correctly
- ✅ New URLs indexed by Google
- ✅ No new 404 errors
- ✅ Traffic stable or increasing

### Month 3:
- ✅ Rankings improved or stable
- ✅ Organic traffic increased
- ✅ Core Web Vitals in "Good" range
- ✅ No technical issues

## 📞 Support

If you encounter issues:
1. Check Google Search Console Help Center
2. Search for specific error messages
3. Ask in Google Search Central Community
4. Consult with SEO expert if needed

---

**Last Updated**: 2025-09-30
**Status**: ✅ Ready for deployment

