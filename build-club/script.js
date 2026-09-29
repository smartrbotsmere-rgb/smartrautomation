AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 60 });

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  gsap.to('#hero-mock', {
    y: -8,
    rotate: 0.6,
    duration: 3.4,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
    delay: 1
  });

  gsap.utils.toArray('#proof-mock .stage').forEach(function (el, i) {
    gsap.fromTo(el, { opacity: 0, x: -14 }, {
      opacity: 1,
      x: 0,
      duration: 0.5,
      delay: i * 0.1,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });

  gsap.fromTo('#offer-card', { y: 34, opacity: 0 }, {
    y: 0,
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: { trigger: '#offer-card', start: 'top 85%' }
  });
}