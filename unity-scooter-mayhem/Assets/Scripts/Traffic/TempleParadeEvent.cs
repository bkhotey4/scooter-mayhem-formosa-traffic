using System;
using UnityEngine;

namespace ScooterMayhem.Traffic
{
    /// <summary>
    /// Temple Fair Parade & Firecracker Minefield (宮廟陣頭繞境神轎與鞭炮路障):
    /// Moving palanquin barricade across intersections, with crackling red firecrackers
    /// that jolt scooter suspension and reward the "炸邯鄲大吉大利" combo!
    /// </summary>
    public class TempleParadeEvent : MonoBehaviour
    {
        [Header("Palanquin Sway")]
        [SerializeField] private float swayAmplitude = 3.5f;
        [SerializeField] private float swaySpeed = 1.5f;
        [SerializeField] private AudioSource templeGongAudio;

        [Header("Firecracker Strip")]
        [SerializeField] private ParticleSystem firecrackerParticles;
        [SerializeField] private AudioSource firecrackerAudio;

        private float initialX;
        private float timer = 0f;
        private bool firecrackerExploded = false;

        public event Action<string, int> OnFirecrackerPassed;

        private void Start()
        {
            initialX = transform.position.x;
        }

        private void Update()
        {
            timer += Time.deltaTime;
            // Sways back and forth across road
            float newX = initialX + Mathf.Sin(timer * swaySpeed) * swayAmplitude;
            transform.position = new Vector3(newX, transform.position.y, transform.position.z);
        }

        private void OnTriggerEnter(Collider other)
        {
            if (other.CompareTag("Player") && !firecrackerExploded)
            {
                firecrackerExploded = true;
                if (firecrackerParticles != null) firecrackerParticles.Play();
                if (firecrackerAudio != null) firecrackerAudio.Play();

                var vehicle = other.GetComponentInParent<Vehicle.ScooterVehicleController>();
                if (vehicle != null)
                {
                    OnFirecrackerPassed?.Invoke("炸邯鄲大吉大利！勇闖鞭炮陣！", 1500);
                }
            }
        }
    }
}
