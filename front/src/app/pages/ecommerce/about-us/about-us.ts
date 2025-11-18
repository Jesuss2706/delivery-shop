import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  description: string;
}

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-us.html',
  styleUrls: ['./about-us.css']
})
export class AboutUsComponent {
  companyDescription = `En TechPads, somos una empresa dedicada a la venta de productos tecnológicos y 
  componentes de computador de alta calidad. Desde hace más de cuatro años, brindamos soluciones innovadoras 
  a nuestros clientes desde nuestra sede física en Carrera 15 #98-27, Bogotá, Colombia. Nos caracterizamos 
  por ofrecer un servicio confiable, asesoría personalizada y una amplia variedad de productos que se adaptan 
  a las necesidades de cada usuario, desde entusiastas de la tecnología hasta profesionales del sector. 
  En TechPads trabajamos cada día para acercarte a la tecnología de manera fácil, segura y accesible.`;

  groupPhoto = 'images/sofitaabrite.jpg';

  teamMembers: TeamMember[] = [
    {
      name: 'Juan Pablo Collazos',
      role: 'Tester',
      image: 'images/juanpablo.png',
      description: 'Especialista en aseguramiento de calidad, garantiza que cada funcionalidad de TechPads opere de manera óptima, brindando la mejor experiencia a nuestros clientes.'
    },
    {
      name: 'Nicole Burbano',
      role: 'Analista',
      image: 'images/nicole.png',
      description: 'Experta en análisis de requerimientos y procesos de negocio, transforma las necesidades de nuestros clientes en soluciones tecnológicas efectivas.'
    },
    {
      name: 'Valeria Muñoz',
      role: 'Analista',
      image: 'images/valeria.png',
      description: 'Analista dedicada al estudio del mercado tecnológico y comportamiento de usuarios, asegurando que nuestros servicios estén siempre alineados con las tendencias del sector.'
    },
    {
      name: 'Camilo Henao',
      role: 'Front End Developer',
      image: 'images/camilo.png',
      description: 'Desarrollador creativo enfocado en diseñar interfaces intuitivas y atractivas que facilitan la navegación y compra de productos tecnológicos.'
    },
    {
      name: 'Jesús Lasso',
      role: 'Back End Developer',
      image: 'images/jesus.png',
      description: 'Ingeniero backend responsable de la arquitectura robusta y segura de la plataforma, garantizando un sistema confiable para todas las transacciones.'
    }
  ];

  constructor() { }
}