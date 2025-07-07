export const AnimatedImageBackground = () => {
  const images = [
    '/public/placeholder.svg',
    '/public/placeholder.svg',
    '/public/placeholder.svg',
    '/public/placeholder.svg',
  ];

  return (
    <div className="fixed inset-0 overflow-hidden -z-20">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-black"></div>
      {images.map((image, index) => (
        <div
          key={index}
          className="absolute w-64 h-64 opacity-10 animate-float"
          style={{
            left: `${(index * 25) % 100}%`,
            top: `${(index * 30) % 100}%`,
            animationDelay: `${index * 2}s`,
            animationDuration: `${8 + index * 2}s`,
          }}
        >
          <img
            src={image}
            alt=""
            className="w-full h-full object-cover rounded-lg filter blur-sm"
          />
        </div>
      ))}
    </div>
  );
};
