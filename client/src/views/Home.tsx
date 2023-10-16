import { Container } from '@/components/shared'

const Home = () => {
    return (
        <Container className="flex h-full items-center justify-center">
            <img
                src="/img/others/home.png"
                alt="welcome"
                style={{ maxWidth: '100%', width: '500px' }}
            />
        </Container>
    )
}

export default Home
